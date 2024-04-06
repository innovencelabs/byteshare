'use client'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import useAuth from '@/context/useAuth'
import appwriteService from '@/authentication/appwrite/config'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import axios from 'axios'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export default function Home() {
  const router = useRouter()
  const { authorised, statusLoaded } = useAuth()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const [uploadSize, setUploadSize] = useState('0 KB')
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [user, setUser] = useState(null)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [receiverEmail, setReceiverEmail] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [postProcessing, setPostProcessing] = useState(false)
  const [willShareEmail, setWillShareEmail] = useState(false)
  const [shareURL, setShareURL] = useState('')
  const [shareQR, setShareQR] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [downloadsAllowed, setDownloadsAllowed] = useState('')
  const [batchCount, setBatchCount] = useState(0)
  const [totalBatch, setTotalBatch] = useState(0)
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
          setUserName(userResponse.name)
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
  }, [statusLoaded, router])

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
      setUploadSize('0 KB')
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
    setUploadSize('0 KB')
    setSubmitDisabled(true)
    setIsDrawerOpen(false)
    setSelectedFiles([])
    setProgress(0)
    setUploading(false)
    setUploaded(false)
    setPostProcessing(false)
    setShareQR('')
    setShareURL('')
    setIsCopied(false)
    setExpirationDate('')
    setDownloadsAllowed('')
    setBatchCount(0)
    setTotalBatch(0)
    setWillShareEmail(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareURL)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleReceiverEmailChange = (e) => {
    setReceiverEmail(e.target.value)
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

    if (selectedFiles.length > 0) {
      try {
        let continueID = ''
        let uploadID = ''

        const batchSize = 3
        const totalFiles = selectedFiles.length
        const totalBatches = Math.ceil(totalFiles / batchSize)
        let filesUploaded = 0

        const uploadBatch = async (files, batchUrls) => {
          return new Promise<void>(async (resolve, reject) => {
            const totalFilesInBatch = files.length
            let totalBytesUploaded = 0
            let totalBytesExpected = files.reduce(
              (acc, file) => acc + file.size,
              0,
            )
            let fileProgresses = Array(files.length).fill(0)

            const calculateAggregateProgress = (fileProgresses) => {
              if (fileProgresses.length === 0) return 0
              const totalProgress = fileProgresses.reduce(
                (acc, curr) => acc + curr,
                0,
              )
              return totalProgress / fileProgresses.length // Calculate average progress
            }

            const uploadPromises = files.map(async (file, index) => {
              try {
                const response = await axios.put(batchUrls[index], file, {
                  onUploadProgress: (progressEvent) => {
                    const loaded = progressEvent.loaded
                    const total = progressEvent.total
                    const fileProgress = (loaded / total) * 100
                    fileProgresses[index] = fileProgress

                    const aggregateProgress =
                      calculateAggregateProgress(fileProgresses)
                    setProgress(aggregateProgress)
                  },
                })

                if (response.status !== 200) {
                  throw new Error(
                    `Unexpected response status: ${response.status}`,
                  )
                }
              } catch (error) {
                reject(error)
              }
            })

            try {
              await Promise.all(uploadPromises)
              resolve()
            } catch (error) {
              reject(error)
            }
          })
        }
        setBatchCount(1)
        for (let batch = 0; batch < totalBatches; batch++) {
          setTotalBatch(totalBatches)
          const start = batch * batchSize
          const end = Math.min((batch + 1) * batchSize, totalFiles)
          const batchFiles = selectedFiles.slice(start, end)

          let batchURL = []

          for (let i = start; i < end; i++) {
            if (i == 0) {
              const firstFileResponse = await uploadFirstFile(selectedFiles[0])
              uploadID = firstFileResponse.uploadID
              let uploadURL = firstFileResponse.uploadURL
              continueID = firstFileResponse.continueID
              batchURL.push(uploadURL)

              continue
            }
            const fileResponse = await uploadFile(
              selectedFiles[i],
              uploadID,
              continueID,
            )
            let uploadURL = fileResponse.uploadURL
            batchURL.push(uploadURL)
          }
          setProgress(0)
          setBatchCount(batch + 1)
          await uploadBatch(batchFiles, batchURL)
          filesUploaded += batchFiles.length
        }
        setPostProcessing(true)
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
        setPostProcessing(false)
        setSubmitDisabled(true)
        setUploadSize('0 KB')
        setSelectedFiles([])
        setBatchCount(0)
        setTotalBatch(0)
        setWillShareEmail(false)
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
        },
      },
    )
    const data = await initiateUploadResponse.json()
    const uploadURL = data.upload_url

    return { uploadURL }
  }

  const uploadFirstFile = async (file) => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    const firstFileJSON = {
      file_name: file.name,
      creator_id: user['$id'],
      creator_email: userEmail,
      creator_ip: '127.0.0.1',
      share_email_as_source: true,
    }

    const initiateUploadResponse = await fetch(apiBaseURL + '/initiateUpload', {
      method: 'POST',
      body: JSON.stringify(firstFileJSON),
      headers: {
        'File-Length': file.size,
        'Content-Type': 'application/json',
      },
    })
    const data = await initiateUploadResponse.json()
    const uploadURL = data.upload_url
    const continueID = data.continue_id
    const uploadID = data.upload_id

    return { uploadID, uploadURL, continueID }
  }

  const postUpload = async (fileNames, uploadID) => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    const fileJSON = {
      file_names: fileNames,
      receiver_email: receiverEmail,
      user_id: user['$id'],
    }
    const postUploadResponse = await fetch(
      apiBaseURL + '/postUpload' + '/' + uploadID,
      {
        method: 'POST',
        body: JSON.stringify(fileJSON),
        headers: {
          'Content-Type': 'application/json',
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
      <Header
        authorised={authorised}
        statusLoaded={statusLoaded}
        name={userName}
        email={userEmail}
      />
      {/* <p className="flex align-items-center z-10">hey</p> */}
      <Drawer open={isDrawerOpen} onClose={handleDrawerClose}>
        <div className="flex-grow flex items-center justify-center z-10">
          <DrawerTrigger asChild>
            {/* <div className="px-12 py-8 border-2 border-black rounded-2xl"> */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="font-semibold text-3xl border-2 border-blue-100 shadow-lg px-20 py-20 bg-blue-100 text-blue-800 hover:bg-slate-200 hover:text-blue-800 rounded-2xl"
                    onClick={() => handleSend()}
                    disabled={!statusLoaded}
                  >
                    Send
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-black">
                  <p>Send files</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* </div> */}
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

                    <Input
                      className="mt-2"
                      id="email"
                      type="email"
                      value={receiverEmail}
                      onChange={handleReceiverEmailChange}
                      placeholder="Email address of receiver (optional)"
                      required={false}
                    />
                    {/* <div className="mt-2 border-l-4 border-slate-100 bg-gradient-linear bg-cover bg-no-repeat bg-left-bottom w-full h-0.5">
                      <div className="bg-gradient-linear bg-cover bg-no-repeat bg-left-bottom w-full h-0.5 bg-slate-200"></div>
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                      <Checkbox
                        id="share-email"
                        checked={willShareEmail}
                        onClick={() => setWillShareEmail(!willShareEmail)}
                      />
                      <Label htmlFor="share-email">
                        Share my email address as source.{' '}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="link"
                              className="px-0 py-0 text-blue-500"
                            >
                              Why?
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 text-sm font-normal">
                            Displaying your email as the upload source verifies
                            ownership and increases transparency.
                          </PopoverContent>
                        </Popover>
                      </Label>
                    </div> */}
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
                  {!postProcessing ? (
                    <Label>
                      {progress.toFixed(1)}% ({batchCount}/{totalBatch} batch)
                    </Label>
                  ) : (
                    <Label>Processing...</Label>
                  )}
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
                <div className="flex justify-center">
                    <div className="sharing-buttons flex flex-wrap">
                      <a
                        className="border-2 duration-200 ease inline-flex items-center mb-1 mr-1 transition p-1 rounded text-white border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700"
                        target="_blank"
                        rel="noopener"
                        href="https://facebook.com/sharer/sharer.php?u="
                        aria-label="Share on Facebook"
                        draggable="false"
                      >
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="w-4 h-4"
                        >
                          <title>Facebook</title>
                          <path d="M379 22v75h-44c-36 0-42 17-42 41v54h84l-12 85h-72v217h-88V277h-72v-85h72v-62c0-72 45-112 109-112 31 0 58 3 65 4z"></path>
                        </svg>
                      </a>
                      <a
                        className="border-2 duration-200 ease inline-flex items-center mb-1 mr-1 transition p-1 rounded text-white border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700"
                        target="_blank"
                        rel="noopener"
                        href="https://twitter.com/intent/tweet?url=&amp;text=%F0%9F%93%81%20Just%20shared%20a%20file%20using%20ByteShare.io%20%F0%9F%93%81%0A%0AEffortless%20file%20sharing%20via%20link.%20Check%20it%20out%3A%0A%0Ahttps%3A%2F%2Fbyteshare.io%2Fshare%2Feqwfklnflkwenflknefew"
                        aria-label="Share on Twitter"
                      >
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="w-4 h-4"
                        >
                          <title>Twitter</title>
                          <path d="m459 152 1 13c0 139-106 299-299 299-59 0-115-17-161-47a217 217 0 0 0 156-44c-47-1-85-31-98-72l19 1c10 0 19-1 28-3-48-10-84-52-84-103v-2c14 8 30 13 47 14A105 105 0 0 1 36 67c51 64 129 106 216 110-2-8-2-16-2-24a105 105 0 0 1 181-72c24-4 47-13 67-25-8 24-25 45-46 58 21-3 41-8 60-17-14 21-32 40-53 55z"></path>
                        </svg>
                      </a>
                      <a
                        className="border-2 duration-200 ease inline-flex items-center mb-1 mr-1 transition p-1 rounded text-white border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700"
                        target="_blank"
                        rel="noopener"
                        href="https://www.linkedin.com/shareArticle?mini=true&amp;url=&amp;title=%F0%9F%93%81%20Just%20shared%20a%20file%20using%20ByteShare.io%20%F0%9F%93%81%0A%0AEffortless%20file%20sharing%20via%20link.%20Check%20it%20out%3A%0A%0Ahttps%3A%2F%2Fbyteshare.io%2Fshare%2Feqwfklnflkwenflknefew&amp;summary=%F0%9F%93%81%20Just%20shared%20a%20file%20using%20ByteShare.io%20%F0%9F%93%81%0A%0AEffortless%20file%20sharing%20via%20link.%20Check%20it%20out%3A%0A%0Ahttps%3A%2F%2Fbyteshare.io%2Fshare%2Feqwfklnflkwenflknefew&amp;source="
                        aria-label="Share on Linkedin"
                      >
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="w-4 h-4"
                        >
                          <title>Linkedin</title>
                          <path d="M136 183v283H42V183h94zm6-88c1 27-20 49-53 49-32 0-52-22-52-49 0-28 21-49 53-49s52 21 52 49zm333 208v163h-94V314c0-38-13-64-47-64-26 0-42 18-49 35-2 6-3 14-3 23v158h-94V183h94v41c12-20 34-48 85-48 62 0 108 41 108 127z"></path>
                        </svg>
                      </a>
                      <a
                        className="border-2 duration-200 ease inline-flex items-center mb-1 mr-1 transition p-1 rounded text-white border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700"
                        target="_blank"
                        rel="noopener"
                        href="https://reddit.com/submit/?url=&amp;resubmit=true&amp;title=%F0%9F%93%81%20Just%20shared%20a%20file%20using%20ByteShare.io%20%F0%9F%93%81%0A%0AEffortless%20file%20sharing%20via%20link.%20Check%20it%20out%3A%0A%0Ahttps%3A%2F%2Fbyteshare.io%2Fshare%2Feqwfklnflkwenflknefew"
                        aria-label="Share on Reddit"
                        draggable="false"
                      >
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="w-4 h-4"
                        >
                          <title>Reddit</title>
                          <path d="M440 204c-15 0-28 6-38 15-35-24-83-40-137-42l28-125 88 20c0 22 18 39 39 39 22 0 40-18 40-39s-17-40-40-40c-15 0-28 9-35 22l-97-22c-5-1-10 3-11 7l-31 138c-53 2-100 18-136 43a53 53 0 0 0-38-16c-56 0-74 74-23 100l-3 24c0 84 95 152 210 152 117 0 211-68 211-152 0-8-1-17-3-25 50-25 32-99-24-99zM129 309a40 40 0 1 1 80 0 40 40 0 0 1-80 0zm215 93c-37 37-139 37-176 0-4-3-4-9 0-13s10-4 13 0c28 28 120 29 149 0 4-4 10-4 14 0s4 10 0 13zm-1-54c-22 0-39-17-39-39a39 39 0 1 1 39 39z"></path>
                        </svg>
                      </a>
                      <a
                        className="border-2 duration-200 ease inline-flex items-center mb-1 mr-1 transition p-1 rounded text-white border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700"
                        target="_blank"
                        rel="noopener"
                        href="https://wa.me/?text=%F0%9F%93%81%20Just%20shared%20a%20file%20using%20ByteShare.io%20%F0%9F%93%81%0A%0AEffortless%20file%20sharing%20via%20link.%20Check%20it%20out%3A%0A%0Ahttps%3A%2F%2Fbyteshare.io%2Fshare%2Feqwfklnflkwenflknefew%20"
                        aria-label="Share on Whatsapp"
                        draggable="false"
                      >
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="w-4 h-4"
                        >
                          <title>Whatsapp</title>
                          <path d="M413 97A222 222 0 0 0 64 365L31 480l118-31a224 224 0 0 0 330-195c0-59-25-115-67-157zM256 439c-33 0-66-9-94-26l-7-4-70 18 19-68-4-7a185 185 0 0 1 287-229c34 36 56 82 55 131 1 102-84 185-186 185zm101-138c-5-3-33-17-38-18-5-2-9-3-12 2l-18 22c-3 4-6 4-12 2-32-17-54-30-75-66-6-10 5-10 16-31 2-4 1-7-1-10l-17-41c-4-10-9-9-12-9h-11c-4 0-9 1-15 7-5 5-19 19-19 46s20 54 23 57c2 4 39 60 94 84 36 15 49 17 67 14 11-2 33-14 37-27s5-24 4-26c-2-2-5-4-11-6z"></path>
                        </svg>
                      </a>
                      <a
                        className="border-2 duration-200 ease inline-flex items-center mb-1 mr-1 transition p-1 rounded text-white border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700"
                        target="_blank"
                        rel="noopener"
                        href="https://telegram.me/share/url?text=%F0%9F%93%81%20Just%20shared%20a%20file%20using%20ByteShare.io%20%F0%9F%93%81%0A%0AEffortless%20file%20sharing%20via%20link.%20Check%20it%20out%3A%0A%0Ahttps%3A%2F%2Fbyteshare.io%2Fshare%2Feqwfklnflkwenflknefew&amp;url="
                        aria-label="Share on Telegram"
                        draggable="false"
                      >
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="w-4 h-4"
                        >
                          <title>Telegram</title>
                          <path d="M256 8a248 248 0 1 0 0 496 248 248 0 0 0 0-496zm115 169c-4 39-20 134-28 178-4 19-10 25-17 25-14 2-25-9-39-18l-56-37c-24-17-8-25 6-40 3-4 67-61 68-67l-1-4-5-1q-4 1-105 70-15 10-27 9c-9 0-26-5-38-9-16-5-28-7-27-16q1-7 18-14l145-62c69-29 83-34 92-34 2 0 7 1 10 3l4 7a43 43 0 0 1 0 10z"></path>
                        </svg>
                      </a>
                      <a
                        className="border-2 duration-200 ease inline-flex items-center mb-1 mr-1 transition p-1 rounded text-white border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700"
                        target="_blank"
                        rel="noopener"
                        href="mailto:?subject=%F0%9F%93%81%20Just%20shared%20a%20file%20using%20ByteShare.io%20%F0%9F%93%81%0A%0AEffortless%20file%20sharing%20via%20link.%20Check%20it%20out%3A%0A%0Ahttps%3A%2F%2Fbyteshare.io%2Fshare%2Feqwfklnflkwenflknefew&amp;body="
                        aria-label="Share by Email"
                        draggable="false"
                      >
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="w-4 h-4"
                        >
                          <title>Email</title>
                          <path d="M464 64a48 48 0 0 1 29 86L275 314c-11 8-27 8-38 0L19 150a48 48 0 0 1 29-86h416zM218 339c22 17 54 17 76 0l218-163v208c0 35-29 64-64 64H64c-35 0-64-29-64-64V176l218 163z"></path>
                        </svg>
                      </a>
                    </div>
                  
                </div>
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
          className="z-0"
        />
      </div>
      <div className="text-left absolute bottom-3">
        <p className="text-black text-xl sm:text-1xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">
          Manage,
        </p>
        <p className="text-blue-100 text-xl sm:text-1xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold">
          Share, Secure. Effortlessly.
        </p>
      </div>
      <div className="absolute inset-0 bg-black opacity-5 z-1"></div>
    </div>
  )
}
