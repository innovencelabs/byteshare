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
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const jwtToken = await appwriteService.getJWTToken()

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
          'x-api-key': apiKey,
          Authorization: 'Bearer ' + jwtToken.jwt,
        },
      },
    )
    const data = await initiateUploadResponse.json()
    const uploadURL = data.upload_url

    return { uploadURL }
  }

  const uploadFirstFile = async (file) => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const jwtToken = await appwriteService.getJWTToken()

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
        'x-api-key': apiKey,
        Authorization: 'Bearer ' + jwtToken.jwt,
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
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const jwtToken = await appwriteService.getJWTToken()

    const fileJSON = {
      file_names: fileNames,
      receiver_email: receiverEmail,
      sender_name: userName,
    }
    const postUploadResponse = await fetch(
      apiBaseURL + '/postUpload' + '/' + uploadID,
      {
        method: 'POST',
        body: JSON.stringify(fileJSON),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          Authorization: 'Bearer ' + jwtToken.jwt,
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
                    <Label htmlFor="receiver-email"></Label>
                    <Input
                      className="mt-2"
                      id="receiver-email"
                      type="email"
                      value={receiverEmail}
                      onChange={handleReceiverEmailChange}
                      placeholder="Email address of receiver (optional)"
                      required={false}
                      onPointerDown={(e) => e.stopPropagation()}
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
