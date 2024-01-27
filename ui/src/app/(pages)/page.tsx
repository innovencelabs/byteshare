'use client'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import useAuth from '@/context/useAuth'
import appwriteService from '@/authentication/appwrite/config'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Home() {
  const router = useRouter()
  const { authorised } = useAuth()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const [uploadSize, setUploadSize] = useState('0')
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState(null)

  useEffect(() => {
    appwriteService.getCurrentUser().then((user) => {
      if (user && from == 'signup' && authorised && !user?.emailVerification) {
        toast.info(
          'Please check your email for a verification link to complete your registration.',
        )
      } else if (
        user &&
        from == 'verify-email' &&
        authorised &&
        user?.emailVerification
      ) {
        toast.success('Email has been successfully verified.')
      }
    })
  }, [authorised])

  const handleSend = () => {
    if (!authorised) {
      router.push('/auth/login')
    }
  }

  const handleUploadChange = (event) => {
    setSubmitDisabled(false)
    const files = event.target.files
    let totalSize = 0
    for (const file of files) {
      totalSize += file.size
    }
    if (totalSize == 0) {
      setSubmitDisabled(true)
      setUploadSize('0')
    } else if (totalSize >= 2 * 1024 * 1024 * 1024) {
      setUploadSize(
        (totalSize / (1024 * 1024 * 1024)).toFixed(2) +
          ' GB' +
          ') (FILE SIZE EXCEEDED',
      )
      setSubmitDisabled(true)
    } else if (totalSize >= 1024 * 1024 * 1024) {
      setUploadSize((totalSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB')
    } else if (totalSize >= 1024 * 1024) {
      setUploadSize((totalSize / (1024 * 1024)).toFixed(2) + ' MB')
    } else if (totalSize >= 1024) {
      setUploadSize((totalSize / 1024).toFixed(2) + ' KB')
    } else {
      setUploadSize(totalSize + ' Bytes')
    }

    setSelectedFiles(files)
  }

  const handleDrawerClose = () => {
    setUploadSize('0')
    setSubmitDisabled(true)
    setIsDrawerOpen(false)
  }

  const handleUploadSubmit = async (event) => {
    event.preventDefault()
    console.log('Starts here')
    let totalSize = 0
    for (const file of selectedFiles) {
      totalSize += file.size
    }
    if (totalSize >= 2 * 1024 * 1024 * 1024) {
      toast.error('File size exceeded.')
      return
    }

    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    if (selectedFiles) {
      try {
        const firstFileJSON = {
          file_name: selectedFiles[0].name,
          creator_email: 'ambujm143@gmail.com',
          creator_ip: '127.0.0.1',
        }
        const response = await fetch(apiBaseURL + '/initiateUpload', {
          method: 'POST',
          body: JSON.stringify(firstFileJSON),
          headers: {
            'File-Length': selectedFiles[0].size,
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        console.log(data.upload_id)
      } catch (e) {
        console.log(e)
      }
    }
  }

  return (
    <div className="h-screen flex flex-col justify-between">
      <Header authorised={authorised} />
      <Drawer open={isDrawerOpen} onClose={handleDrawerClose}>
        <div className="flex-grow flex items-center justify-center z-10">
          <DrawerTrigger asChild onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
            <Button
              className="font-semibold text-3xl shadow-lg px-20 py-20 bg-blue-100 text-blue-800 hover:bg-slate-200 hover:text-blue-800 rounded-2xl"
              onClick={() => handleSend()}
            >
              Send
            </Button>
          </DrawerTrigger>
          {/* <Button
            className="font-semibold text-3xl shadow-lg ml-10 px-20 py-20 bg-slate-200 text-blue-800 hover:bg-blue-100 hover:text-blue-800 rounded-2xl"
            onClick={() => handleSend()}
          >
            Recieve
          </Button> */}
        </div>

        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle className="text-center">Send Files</DrawerTitle>
              <DrawerDescription className="text-center">
                You can select multiple files to share upto 2GB.
              </DrawerDescription>
            </DrawerHeader>
            <form onSubmit={handleUploadSubmit}>
              {' '}
              <div className="p-4">
                <Label htmlFor="files">Files (Size: {uploadSize})</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleUploadChange}
                />
              </div>
              <DrawerFooter>
                <Button disabled={submitDisabled} type="submit">
                  Submit
                </Button>
                <DrawerClose asChild onClick={() => setIsDrawerOpen(false)}>
                  <Button variant="ghost">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
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
