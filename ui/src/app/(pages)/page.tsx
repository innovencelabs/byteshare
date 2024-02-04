'use client'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import useAuth from '@/context/useAuth'
import appwriteService from '@/authentication/appwrite/config'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { CheckIcon, CopyIcon } from '@radix-ui/react-icons'
import TwitterHandle from '@/components/handle'

export default function Home() {
  const router = useRouter()
  const { authorised, statusLoaded } = useAuth()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const [uploadSize, setUploadSize] = useState('0')
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [user, setUser] = useState(null)
  const [userEmail, setUserEmail] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [shareURL, setShareURL] = useState('')
  const [shareQR, setShareQR] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [downloadsAllowed, setDownloadsAllowed] = useState('')
  const audioRef = useRef(null)

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams()
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  useEffect(() => {
    if (statusLoaded) {
      appwriteService.getCurrentUser().then((userResponse) => {
        if (userResponse) {
          setUser(userResponse)
          setUserEmail(userResponse.email)
        }
        if (
          userResponse &&
          from == 'signup' &&
          authorised &&
          !userResponse?.emailVerification
        ) {
          playSound()
          toast.info(
            'Please check your email for a verification link to complete your registration.',
          )
        } else if (
          userResponse &&
          from == 'verify-email' &&
          authorised &&
          userResponse?.emailVerification
        ) {
          toast.success('Email has been successfully verified.')
        }
      })
    }
  }, [statusLoaded])

  const handleSend = async () => {
    setIsDrawerOpen(false)
    if (!authorised) {
      router.push('/auth/login' + '?' + createQueryString('from', 'home'))
    } else if (!user?.emailVerification) {
      toast.error('Email is not verified.')
      await appwriteService.initiateVerification()
    } else {
      setIsDrawerOpen(true)
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

    setSelectedFiles(Array.from(files))
  }

  const handleDrawerClose = () => {
    setUploadSize('0')
    setSubmitDisabled(true)
    setIsDrawerOpen(false)
    setSelectedFiles([])
    setProgress(0)
    setUploading(false)
    setUploaded(false)
    setShareQR('')
    setShareURL('')
    setIsCopied(false)
    setExpirationDate('')
    setDownloadsAllowed('')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareURL)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleUploadSubmit = async (event) => {
    event.preventDefault()
    setProgress(0)
    setSubmitDisabled(true)
    let totalSize = 0
    let fileNames = []
    for (const file of selectedFiles) {
      totalSize += file.size
      fileNames.push(file.name)
    }
    if (totalSize >= 2 * 1024 * 1024 * 1024) {
      toast.error('File size exceeded.')
      return
    }
    setUploading(true)
    setUploaded(false)
    let randomNumberToBegin = 0
    if (selectedFiles.length == 1) {
      if (selectedFiles[0].size > 2 * 1024 * 1024) {
        setTimeout(
          () => setProgress(Math.floor(Math.random() * (30 - 20 + 1)) + 20),
          500,
        )
      } else {
        setTimeout(
          () => setProgress(Math.floor(Math.random() * (49 - 20 + 1)) + 20),
          100,
        )
      }
    } else if (selectedFiles.length > 1) {
      randomNumberToBegin = Math.floor(Math.random() * (6 - 3 + 1)) + 3
      setTimeout(() => setProgress(randomNumberToBegin), 100)
    }

    if (selectedFiles.length > 0) {
      try {
        let firstFileUploadResponse = await uploadFirstFile(selectedFiles[0])
        const continueID = firstFileUploadResponse.continueID
        const uploadID = firstFileUploadResponse.uploadID

        const remainingFiles = selectedFiles.slice(1)
        setProgress(
          randomNumberToBegin +
            (1 / selectedFiles.length) * (100 - randomNumberToBegin),
        )

        // const chunkSize = 3
        // for (let i = 0; i < remainingFiles.length; i += chunkSize) {
        //   const chunk = remainingFiles.slice(i, i + chunkSize)

        //   await Promise.all(
        //     chunk.map((file) => uploadFile(file, uploadID, continueID)),
        //   )

        //   setProgress(((i + chunkSize) / remainingFiles.length) * 100)
        // }

        for (let i = 0; i < remainingFiles.length; i++) {
          await uploadFile(remainingFiles[i], uploadID, continueID)
          setProgress(
            randomNumberToBegin +
              ((i + 1) / selectedFiles.length) * (100 - randomNumberToBegin),
          )
        }

        const postUploadResponse = await postUpload(fileNames, uploadID)
        const shareURL = postUploadResponse.shareURL
        const shareQR = postUploadResponse.shareQR
        const shareExpirationDate = postUploadResponse.expirationDate
        const downloadsAllowed = postUploadResponse.downloadsAllowed

        setUploaded(true)
        setShareQR(shareQR)
        setShareURL(shareURL)
        setExpirationDate(shareExpirationDate)
        setDownloadsAllowed(downloadsAllowed)
      } catch (e) {
        setIsDrawerOpen(false)
        setUploaded(false)
        setShareQR('')
        setShareURL('')
        setIsCopied(false)
        setExpirationDate('')
        setDownloadsAllowed('')
        toast.error('Something went wrong.')
        return
      } finally {
        setUploading(false)
        setSubmitDisabled(true)
        setUploadSize('0')
        setSelectedFiles([])
      }
    }
  }

  const uploadFile = async (file, uploadID, continueID) => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    const fileJSON = {
      file_name: file.name,
      continue_id: continueID,
    }

    const initiateUploadResponse = await fetch(
      apiBaseURL + '/initiateUpload' + '/' + uploadID,
      {
        method: 'POST',
        body: JSON.stringify(fileJSON),
        headers: {
          'File-Length': file.size,
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
      },
    )
    const data = await initiateUploadResponse.json()
    const uploadURL = data.upload_url

    const uploadResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })
  }

  const uploadFirstFile = async (file) => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    const firstFileJSON = {
      file_name: file.name,
      creator_email: userEmail,
      creator_ip: '127.0.0.1',
    }

    const initiateUploadResponse = await fetch(apiBaseURL + '/initiateUpload', {
      method: 'POST',
      body: JSON.stringify(firstFileJSON),
      headers: {
        'File-Length': file.size,
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
      },
    })
    const data = await initiateUploadResponse.json()
    const uploadURL = data.upload_url
    const continueID = data.continue_id
    const uploadID = data.upload_id

    const uploadResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    return { uploadID, continueID }
  }

  const postUpload = async (fileNames, uploadID) => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    const fileJSON = {
      file_names: fileNames,
    }
    const postUploadResponse = await fetch(
      apiBaseURL + '/postUpload' + '/' + uploadID,
      {
        method: 'POST',
        body: JSON.stringify(fileJSON),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
        },
      },
    )
    const data = await postUploadResponse.json()
    const shareURL = data.url
    const shareQR = data.QR
    const expirationDate = data.expiration_date
    const downloadsAllowed = data.downloads_allowed

    return { shareURL, shareQR, expirationDate, downloadsAllowed }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header authorised={authorised} statusLoaded={statusLoaded} />
      {/* <p className="flex align-items-center z-10">hey</p> */}
      <Drawer open={isDrawerOpen} onClose={handleDrawerClose}>
        <div className="flex-grow flex items-center justify-center z-10">
          <DrawerTrigger asChild>
            <Button
              className="font-semibold text-3xl shadow-lg px-20 py-20 bg-blue-100 text-blue-800 hover:bg-slate-200 hover:text-blue-800 rounded-2xl"
              onClick={() => handleSend()}
              disabled={!statusLoaded}
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
              {uploaded ? (
                <>
                  <DrawerTitle className="text-center">
                    Congratulation!
                  </DrawerTitle>
                  <DrawerDescription className="text-center">
                    Your share link has been generated.
                  </DrawerDescription>
                </>
              ) : uploading ? (
                <>
                  <DrawerTitle className="">
                    <Image
                      className="mx-auto max-w-full max-h-full"
                      src="/secure.png"
                      alt="secure icon"
                      height="20"
                      width="20"
                    />
                  </DrawerTitle>
                </>
              ) : (
                <>
                  <DrawerTitle className="text-center">Send Files</DrawerTitle>
                  <DrawerDescription className="text-center">
                    You can select multiple files to share upto 2GB.
                  </DrawerDescription>
                </>
              )}
            </DrawerHeader>{' '}
            {!uploading && !uploaded ? (
              <>
                <form onSubmit={handleUploadSubmit}>
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
              </>
            ) : !uploaded ? (
              <>
                <div className="pt-4">
                  <Label>{progress.toFixed(1)}%</Label>
                  <Progress value={progress} className="m-auto w-[100%]" />

                  <DrawerFooter>
                    <DrawerClose asChild onClick={() => setIsDrawerOpen(false)}>
                      <Button variant="ghost">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </>
            ) : (
              <div className="pt-4">
                <Image
                  src={shareQR}
                  alt="QR code of the share link"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">
                      Link
                    </Label>
                    <Input id="link" defaultValue={shareURL} readOnly />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="px-3"
                    onClick={handleCopy}
                  >
                    <span className="sr-only">Copy</span>
                    {!isCopied ? (
                      <CopyIcon className="h-4 w-4" />
                    ) : (
                      <CheckIcon className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </div>
                <div className="flex justify-center text-xs mt-1">
                  <span className="font-normal">
                    Enjoy up to {downloadsAllowed} downloads.
                  </span>
                </div>
                <div className="flex justify-center text-xs mt-1">
                  <span className="font-normal mr-1">Expiration date: </span>
                  <span className="font-normal">{expirationDate}</span>
                </div>

                <DrawerFooter>
                  <DrawerClose asChild onClick={() => setIsDrawerOpen(false)}>
                    <Button variant="ghost">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      <audio ref={audioRef} src="/popsound.mp3" />
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
