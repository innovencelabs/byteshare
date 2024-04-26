'use client'
import appwriteService from '@/authentication/appwrite/config'
import { Header } from '@/components/header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAuth from '@/context/useAuth'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

type History = {
  id: string
  title: string
  created: string
  downloaded: number
  maxDownload: number
  size: number
}

function HistoryPage() {
  const [user, setUser] = useState(null)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newTitleUploadID, setNewTitleUploadID] = useState('')
  const [editing, setEditing] = useState(false)
  const [data, setData] = React.useState<History[]>([])
  const [downloading, setDownloading] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false)
  const [deleteUploadID, setDeleteUploadID] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const { authorised, statusLoaded } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      const jwtToken = await appwriteService.getJWTToken()
      const userID = user['$id']

      const historyResponse = await fetch(
        apiBaseURL + '/upload/history' + '/' + userID,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            Authorization: 'Bearer ' + jwtToken.jwt,
          },
        },
      )
      if (!historyResponse.ok) {
        toast.error('User ID is not valid')
        setIsLoading(false)
        return
      }
      const responseData = await historyResponse.json()

      for (const fileName of responseData) {
        const created = fileName['created_at']
        const date = new Date(created)
        const options = {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }
        const isoString = date.toUTCString()
        const formattedDate = isoString.substring(0, 16)
        const history: History = {
          id: fileName['upload_id'],
          title: fileName['title'],
          created: formattedDate,
          size: fileName['total_size'],
          downloaded: fileName['downloaded'],
          maxDownload: fileName['max_download'],
        }
        setData((prevdata) => [...prevdata, history])
      }
      setIsLoading(false)
    }
    if (isMounted) {
      if (user) {
        fetchData()
      } else {
        setIsMounted(false)
      }
    } else {
      setIsMounted(true)
    }
  }, [isMounted])

  useEffect(() => {
    if (statusLoaded) {
      appwriteService.getCurrentUser().then((userResponse) => {
        if (userResponse) {
          setUser(userResponse)
          setUserEmail(userResponse.email)
          setUserName(userResponse.name)
        }
      })
    }
  }, [statusLoaded])

  const handleDownload = async (uploadId: string) => {
    if (!downloading) {
      setDownloading(true)
      const downloadInprogressToastID = toast.loading('Download in progress...', { duration: 9999999 })
      const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      const downloadResponse = await fetch(
        apiBaseURL + '/download' + '/' + uploadId + '?user_id=' + user['$id'],
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
        },
      )
      if (!downloadResponse.ok) {
        setDownloading(false)
        toast.dismiss(downloadInprogressToastID)
        toast.error('Upload ID is not valid')
        return
      }
      const responseData = await downloadResponse.json()
      const fileNames = Object.keys(responseData)
      let files = []

      for (const fileName of fileNames) {
        if (fileName == 'user_email') {
          continue
        }
        const file = {
          name: fileName,
          downloadLink: responseData[fileName]['download_url'],
        }
        files.push(file)
      }

      try {
        const zip = new JSZip()

        for (const file of files) {
          const presignedUrl = file.downloadLink
          const response = await fetch(presignedUrl)
          const blob = await response.blob()

          zip.file(file.name, blob)
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const zipFileName = 'ByteShare_Preview_' + uploadId + '.zip'
        saveAs(zipBlob, zipFileName)
        toast.dismiss(downloadInprogressToastID)
      } catch (err) {
        toast.dismiss(downloadInprogressToastID)
        toast.error('Error downloading zip file.')
      } finally {
        setDownloading(false)
      }
    }
  }

  const handleCopyShareLink = async(uploadId: string) => {
    const shareURL = process.env.NEXT_PUBLIC_APP_URL + '/share/' + uploadId
    await navigator.clipboard.writeText(shareURL)
    toast.info('Copied to clipboard')
  }

  const handleDelete = async (uploadId: string) => {
    setOpenDeleteConfirmation(false)
    const deleteInprogressToastID = toast.loading('Delete in progress...', { duration: 9999999 })
    try{
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const jwtToken = await appwriteService.getJWTToken()
    
    const deleteJSON = {
      user_id: user['$id'],
    }
    const deleteResponse = await fetch(
      apiBaseURL + '/upload' + '/' + uploadId,
      {
        method: 'DELETE',
        body: JSON.stringify(deleteJSON),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          Authorization: 'Bearer ' + jwtToken.jwt,
        },
      },
    )
    if (deleteResponse.ok) {
      const index = data.findIndex((history) => history.id == uploadId)
      if (index !== -1) {
        const newData = [...data.slice(0, index), ...data.slice(index + 1)]
        setData(newData)
      }
      toast.dismiss(deleteInprogressToastID)
      toast.success('Successfully deleted.')
    }
  } catch (err) {
    toast.dismiss(deleteInprogressToastID)
    toast.error('Something went wrong.')
  } finally {
    setDeleteUploadID('')
  }
  }

  const handleEditTitle = async(event) => {
    event.preventDefault()
    if(!editing){
      const editInprogressToastID = toast.loading('Edit in progress...', { duration: 9999999 })
      setEditing(true)
      setOpenEditDialog(false)

      try{
        const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
        const apiKey = process.env.NEXT_PUBLIC_API_KEY
        const jwtToken = await appwriteService.getJWTToken()

        const editJSON = {
          user_id: user['$id'],
          title: newTitle,
        }
        const editResponse = await fetch(
          apiBaseURL + '/upload' + '/' + newTitleUploadID + '/title',
          {
            method: 'PUT',
            body: JSON.stringify(editJSON),
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              Authorization: 'Bearer ' + jwtToken.jwt,
            },
          },
        )
        if (editResponse.ok) {
          const index = data.findIndex((history) => history.id == newTitleUploadID)
          if (index !== -1) {
            const updatedData = data.map((history) => {
              if (history.id == newTitleUploadID) {
                return { ...history, title: newTitle}
              }
              return history
            })
            setData(updatedData)
          }
          toast.dismiss(editInprogressToastID)
          toast.success('Successfully updated.')
        }
      } catch (err){
        toast.dismiss(editInprogressToastID)
      } finally {
        setNewTitle('')
        setEditing(false)
        setNewTitleUploadID('')
        
      }
  }
    

  }

  const columns: ColumnDef<History>[] = [
    {
      accessorKey: 'title',
      header: () => <div className="text-left">Title</div>,
      cell: ({ row }) => <div>{row.original.title}</div>,
    },
    {
      accessorKey: 'created',
      header: () => <div className="text-left">Created</div>,
      cell: ({ row }) => <div>{row.original.created}</div>,
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => <div>{row.original.size}</div>,
    },
    {
      accessorKey: 'downloaded',
      header: () => <div className="text-right">Downloads</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {row.original.downloaded}
          </div>
        )
      },
    },
    {
      accessorKey: 'maxDownload',
      header: () => <div className="text-right">Max Downloads</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {row.original.maxDownload}
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem
                onClick={() =>
                  window.open(
                    process.env.NEXT_PUBLIC_APP_URL +
                      '/share/' +
                      row.original.id,
                    '_blank',
                  )
                }
              >
                Preview
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem>
                <Dialog>
                  <DialogTrigger><button>Edit title</button></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>abc</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        
                        <Input
                          id="name"
                          value="Pedro Duarte"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem> */}
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                onClick={() => {
                  setOpenEditDialog(true)
                  setNewTitle(row.original.title)
                  setNewTitleUploadID(row.original.id)
                }}
                disabled={editing}
              >
                Edit title
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDownload(row.original.id)}
                disabled={downloading}
              >
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCopyShareLink(row.original.id)}
              >
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => {
                  setOpenDeleteConfirmation(true)
                  setDeleteUploadID(row.original.id)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: 3,
      },
    },
    state: {
      columnVisibility,
      columnFilters,
    },
  })

  return (
    <div className="h-screen flex flex-col justify-between">
      <Header
        authorised={authorised}
        statusLoaded={statusLoaded}
        name={userName}
        email={userEmail}
      />
      <div className="flex items-center justify-center h-[60%] w-[80%] m-auto bg-white rounded-md z-10">
        <div className="w-[90%]">
          <div className="flex items-center mb-2">
            <p className="font-bold text-lg text-left pb-1">Transfer History</p>
            <div className="hidden md:flex md:flex-1 md:justify-end">
              <Input
                placeholder="Search by title"
                value={
                  (table.getColumn('title')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table.getColumn('title')?.setFilterValue(event.target.value)
                }
                className="max-w-xs w-auto"
              />
            </div>
          </div>
          <div className="rounded-md border ">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {isLoading ? (
                        <>
                          <Skeleton className="ml-[20%] mb-2 h-4 w-[60%]" />
                          <Skeleton className="ml-[20%]  mb-2 h-4 w-[60%]" />
                          <Skeleton className="ml-[20%]  mb-2 h-4 w-[60%]" />
                        </>
                      ) : (
                        <div className="font-serif">No results.</div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end items-center py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Count: {table.getFilteredRowModel().rows.length}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0">
        <Image
          src="/background.jpg"
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
      </div>
      <AlertDialog
        open={openDeleteConfirmation}
        onOpenChange={() => {
          setOpenDeleteConfirmation(false)
          setDeleteUploadID('')
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your upload.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => handleDelete(deleteUploadID)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={openEditDialog}
        onOpenChange={() => {
          setOpenEditDialog(false)
          setNewTitle('')
          setNewTitleUploadID('')
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-md ">
          <form onSubmit={handleEditTitle}>
            <DialogHeader>
              <DialogTitle>Edit Title</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Title"
                  className="col-span-4"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="absolute inset-0 bg-black opacity-5 z-1"></div>
    </div>
  )
}

export default HistoryPage
