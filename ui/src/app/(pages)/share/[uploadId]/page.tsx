'use client'
import Image from 'next/image'
import { Header } from '@/components/header'
import React, { useEffect, useState } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import TwitterHandle from '@/components/handle'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

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

const columns: ColumnDef<File>[] = [
  {
    accessorKey: 'name',
    header: () => <div className="text-left">File Name</div>,
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: 'format',
    header: 'Format',
    cell: ({ row }) => <div className="uppercase">{row.original.format}</div>,
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
          onClick={() => {
            handleDownload(row.original.downloadLink, row.original.name)
          }}
        >
          <span className="sr-only">Download</span>
          <DownloadIcon className="h-4 w-4" />
        </Button>
      )
    },
  },
]

const handleDownload = (downloadLink: string, fileName: string) => {
  // window.location.href = `${downloadLink}&response-content-disposition=attachment; filename="${fileName}"`
  window.location.href = downloadLink
}

function SharePage({ params }: Params) {
  const { authorised } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = React.useState<File[]>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  useEffect(() => {
    const fetchData = async () => {
      const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL

      const downloadResponse = await fetch(
        apiBaseURL + '/download' + '/' + params.uploadId,
      )
      if (!downloadResponse.ok) {
        toast.error('Upload ID is not valid')
        setIsLoading(false)
        return
      }
      const responseData = await downloadResponse.json()
      const fileNames = Object.keys(responseData)

      for (const fileName of fileNames) {
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    state: {
      columnVisibility,
    },
  })

  return (
    <div className="h-screen flex flex-col justify-between">
      <Header authorised={authorised} />
      <div className=" flex items-center justify-center h-[60%] w-[80%] m-auto bg-white rounded-md z-10">
        <div className="w-[90%]">
          <p className="font-bold text-lg text-left pb-5">
            {data.length > 0 ? 'Files are here and waiting!' : ''}
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
                <Button variant="default">Download all</Button>
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
      <TwitterHandle />
      <div className="absolute inset-0">
        <Image
          src="/background.jpg"
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          className="z-0 "
        />
      </div>
      <div className="absolute inset-0 bg-black opacity-5 z-1"></div>
    </div>
  )
}

export default SharePage
