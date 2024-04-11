'use client'
import appwriteService from '@/authentication/appwrite/config'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
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
import { DownloadIcon } from '@radix-ui/react-icons'
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { lookup } from 'mime-types'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Params = {
  params: {
    uploadId: string
  }
}

type File = {
  format: string
  name: string
  size: string
  downloadLink: string
}

function SharePage({ params }: Params) {
  const { authorised, statusLoaded } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [downloadingOne, setDownloadingOne] = useState(false)
  const [data, setData] = React.useState<File[]>([])
  const [source, setSource] = useState(null)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  useEffect(() => {
    const fetchData = async () => {
      const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      const jwtToken = await appwriteService.getJWTToken()

      const downloadResponse = await fetch(
        apiBaseURL + '/download' + '/' + params.uploadId,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            Authorization: 'Bearer ' + jwtToken.jwt,
          },
        },
      )
      if (!downloadResponse.ok) {
        toast.dismiss()
        toast.error('Upload ID is not valid')
        setIsLoading(false)
        return
      }
      const responseData = await downloadResponse.json()
      const fileNames = Object.keys(responseData)

      for (const fileName of fileNames) {
        if (fileName == 'user_email') {
          setSource(responseData[fileName])
          continue
        }
        const file: File = {
          format: responseData[fileName]['format'],
          name: fileName,
          size: responseData[fileName]['size'],
          downloadLink: responseData[fileName]['download_url'],
        }
        setData((prevdata) => [...prevdata, file])
      }
      setIsLoading(false)
    }
    if (isMounted) {
      fetchData()
    } else {
      setIsMounted(true)
    }
  }, [isMounted])

  useEffect(() => {
    if (statusLoaded) {
      appwriteService.getCurrentUser().then((userResponse) => {
        if (userResponse) {
          setUserEmail(userResponse.email)
          setUserName(userResponse.name)
        }
      })
    }
  }, [statusLoaded])

  const handleSingleDownload = async (
    downloadLink: string,
    fileName: string,
  ) => {
    try {
      setDownloadingOne(true)
      toast.info('Download in progress...', { duration: 9999999 })
      const response = await fetch(downloadLink)
      const blob = await response.blob()
      saveAs(blob, fileName)
      toast.dismiss()
    } catch (err) {
      toast.dismiss()
      toast.error('Error in downloading file')
    } finally {
      setDownloadingOne(false)
    }
  }

  const columns: ColumnDef<File>[] = [
    {
      accessorKey: 'name',
      header: () => <div className="text-left">File Name</div>,
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      accessorKey: 'format',
      header: 'Format',
      cell: ({ row }) => (
        <div className="lowercase">
          {String(lookup(row.original.name)).includes('/')
            ? String(lookup(row.original.name)).split('/')[1]
            : String(lookup(row.original.name))}
        </div>
      ),
    },
    {
      accessorKey: 'size',
      header: () => <div className="text-right">Size</div>,
      cell: ({ row }) => {
        const size = row.original.size

        return <div className="text-right font-medium">{size}</div>
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            disabled={downloadingOne}
            onClick={() => {
              handleSingleDownload(row.original.downloadLink, row.original.name)
            }}
          >
            <span className="sr-only">Download</span>
            <DownloadIcon className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  const handleDownloadAll = async () => {
    if (!downloadingAll) {
      setDownloadingAll(true)
      try {
        const presignedUrls = []
        for (const file of data) {
          presignedUrls.push(file.downloadLink)
        }

        const zip = new JSZip()

        for (let i = 0; i < presignedUrls.length; i++) {
          const presignedUrl = presignedUrls[i]
          const response = await fetch(presignedUrl)
          const blob = await response.blob()

          zip.file(data[i].name, blob)
          setProgress(((i + 1) / presignedUrls.length) * 100)
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const zipFileName = 'ByteShare_' + params.uploadId + '.zip'
        saveAs(zipBlob, zipFileName)
      } catch (err) {
        toast.error('Error downloading zip file.')
      } finally {
        setDownloadingAll(false)
        setProgress(0)
        setIsDrawerOpen(false)
      }
    } else {
      setIsDrawerOpen(true)
    }
  }

  const handleDrawerClose = () => {}

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: 3,
      },
    },
    state: {
      columnVisibility,
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
      <div className=" flex items-center justify-center h-[60%] w-[90%] m-auto bg-white rounded-md z-10">
        <div className="w-[90%]">
          <p className="font-bold text-lg text-left pb-1">
            {data.length > 0 ? 'Files are here and waiting!' : ''}
          </p>
          <p className=" text-xs text-left pb-3">
            {data.length > 0 && source ? 'Source: ' + source : ''}
          </p>
          <div className="rounded-md border">
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
          <div className="flex justify-between items-center py-4">
            <div>
              {data.length > 0 ? (
                <Drawer open={isDrawerOpen} onClose={handleDrawerClose}>
                  <DrawerTrigger asChild onClick={() => setIsDrawerOpen(true)}>
                    <Button variant="default" onClick={handleDownloadAll}>
                      Download all
                    </Button>
                  </DrawerTrigger>

                  <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                      <DrawerHeader>
                        <DrawerTitle className="text-center">
                          Downloading zip...
                        </DrawerTitle>
                      </DrawerHeader>{' '}
                      {downloadingAll ? (
                        <div className="pt-4">
                          <Label>{progress.toFixed(1)}%</Label>
                          <Progress
                            value={progress}
                            className="m-auto w-[100%]"
                          />

                          <DrawerFooter>
                            <DrawerClose
                              asChild
                              onClick={() => setIsDrawerOpen(false)}
                            >
                              <Button variant="ghost">Close</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <></>
              )}
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

      <div className="absolute inset-0 bg-black opacity-5 z-1"></div>
    </div>
  )
}

export default SharePage
