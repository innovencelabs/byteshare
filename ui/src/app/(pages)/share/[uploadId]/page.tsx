'use client'
import Image from 'next/image'
import { Header } from '@/components/header'
import React from 'react'
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

type Params = {
  params: {
    uploadId: string
  }
}

const data: File[] = [
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
  {
    format: 'png',
    name: 'Abc.png',
    size: '20MB',
    downloadLink:
      'https://byteshare-blob.s3.amazonaws.com/a6053861124c46edb69040ad1a3ee53b/_af70b2e2-1d77-11eb-99e1-1f704b24b706%20%281%29.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVHKDBKXW2NTAI4SJ%2F20240128%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240128T133423Z&X-Amz-Expires=21600&X-Amz-SignedHeaders=host&X-Amz-Signature=dc01a51798160c8cc52639960c3b9da39802dfbd380bd342cb21be01fa6700ed',
  },
]

export type File = {
  format: string
  name: string
  size: string
  downloadLink: string
}

export const columns: ColumnDef<File>[] = [
  {
    accessorKey: 'name',
    header: () => <div className="text-left">File Name</div>,
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'format',
    header: 'Format',
    cell: ({ row }) => (
      <div className="uppercase">{row.getValue('format')}</div>
    ),
  },
  {
    accessorKey: 'size',
    header: () => <div className="text-right">Size</div>,
    cell: ({ row }) => {
      const size = row.getValue('size')

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
          onClick={() =>
            handleDownload(row.getValue('downloadLink'), row.getValue('name'))
          }
        >
          <span className="sr-only">Download</span>
          <DownloadIcon className="h-4 w-4" />
        </Button>
      )
    },
  },
]

const handleDownload = (downloadLink: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = downloadLink
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function SharePage({ params }: Params) {
  const { authorised } = useAuth()

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
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
      <div className=" flex items-center justify-center h-[60%] w-[80%] m-auto bg-white z-10">
        <div className="w-[90%]">
          <p className="font-bold text-lg text-left pb-5">
            Files are here and waiting!
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="space-x-2">
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
