'use client'
import appwriteService from '@/authentication/appwrite/config'
import { Header } from '@/components/header'
import LoadingText from '@/components/loading'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import useAuth from '@/context/useAuth'
import { cn } from '@/lib/utils'
import {
  CheckIcon,
  CopyIcon,
  Cross2Icon,
  UploadIcon,
} from '@radix-ui/react-icons'
import axios from 'axios'
import { formatInTimeZone } from 'date-fns-tz'
import { motion } from 'framer-motion'
import { debounce } from 'lodash'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Boxi from 'public/svg/box.svg'
import DesktopHero from 'public/svg/hero_desktop.svg'
import MobileHero from 'public/svg/hero_mobile.svg'
import Waves from 'public/svg/waves.svg'
import { useCallback, useEffect, useRef, useState } from 'react'
import Dropzone from 'react-dropzone'
import { toast } from 'sonner'

export default function Home() {
  const router = useRouter()
  const { authorised, statusLoaded } = useAuth()
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
  const [sendDisabled, setSendDisabled] = useState(true)
  const [postProcessing, setPostProcessing] = useState(false)
  const [willShareEmail, setWillShareEmail] = useState(false)
  const [shareURL, setShareURL] = useState('')
  const [shareQR, setShareQR] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [downloadsAllowed, setDownloadsAllowed] = useState('')
  const [batchCount, setBatchCount] = useState(0)
  const [totalBatch, setTotalBatch] = useState(0)
  const [filesSizeExceededColor, setFilesSizeExceededColor] = useState(false)
  const [disabledViewSelected, setDisabledViewSelected] = useState(true)
  const [realtimeInitiating, setRealtimeInitiating] = useState(false)
  const audioRef = useRef(null)
  const fileAddRef = useRef(null)

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  useEffect(() => {
    if (statusLoaded) {
      appwriteService.getCurrentUser().then((userResponse) => {
        if (userResponse) {
          setUser(userResponse)
          setUserEmail(userResponse.email)
          setUserName(userResponse.name)
        }
      }).finally(() => {
        setSendDisabled(false)
      })
      
    }
  }, [statusLoaded, router])

  const handleSend = async () => {
    setIsDrawerOpen(false)
    if (!authorised) {
      
      toast.info('Please log in to your account to continue.')
      router.push('/auth/login')
    } else if (!user.emailVerification) {
      toast.error('Email is not verified.')
      await appwriteService.initiateVerification()
    } else {
      setIsDrawerOpen(true)
    }
  }

  const formatSize = (size: number) => {
    if (size >= 1024 * 1024 * 1024) {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
    } else if (size >= 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + ' MB'
    } else if (size >= 1024) {
      return (size / 1024).toFixed(2) + ' KB'
    } else {
      return size + ' Bytes'
    }
  }

  const handleUploadChange = useCallback(debounce((files) => {
    setSubmitDisabled(true)
    setDisabledViewSelected(false)
    setFilesSizeExceededColor(false)
    
    let totalSize = 0
    for (const file of files) {
      totalSize += file.size
    }
    if (totalSize == 0) {
      setSubmitDisabled(true)
      setDisabledViewSelected(true)
      setUploadSize('0 KB')
      setSelectedFiles(Array.from(files))
      return
    } else if (totalSize >= 2 * 1024 * 1024 * 1024 || files.length > 1000) {
      setUploadSize(formatSize(totalSize))
      setSubmitDisabled(true)
      setFilesSizeExceededColor(true)
      setSelectedFiles(Array.from(files))
      return
    } else {
      setUploadSize(formatSize(totalSize))
    }
    setSelectedFiles(Array.from(files))
    setSubmitDisabled(false)
  }, 300), [])

  const handleAddFile = (event) => {
    const files = Array.from(event.target.files)

    const newFiles = files.filter(
      (file: any) =>
        !selectedFiles.some(
          (prevFile) =>
            prevFile.name === file.name && prevFile.size === file.size,
        ),
    )
    const updatedFiles =  [...selectedFiles, ...newFiles]

    handleUploadChange(updatedFiles)

  }

  const handleDrawerClose = () => {
    setUploadSize('0 KB')
    setSubmitDisabled(true)
    setDisabledViewSelected(true)
    setFilesSizeExceededColor(false)
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
    setRealtimeInitiating(false)
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
    setDisabledViewSelected(true)
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

        setTotalBatch(totalBatches)

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
        
        const initiateUploadResponse = await initiateFilesUpload(selectedFiles)
        uploadID = initiateUploadResponse.uploadID
        const uploadURLs = initiateUploadResponse.uploadURLs
        setBatchCount(1)
        for (let batch = 0; batch < totalBatches; batch++) {
          const start = batch * batchSize
          const end = Math.min((batch + 1) * batchSize, totalFiles)
          const batchFiles = selectedFiles.slice(start, end)

          let batchURL = []

          for (let i = start; i < end; i++) {
            batchURL.push(uploadURLs[selectedFiles[i].name])
          }
          setProgress(0)
          setBatchCount(batch + 1)
          await uploadBatch(batchFiles, batchURL)
          filesUploaded += batchFiles.length
        }
        setPostProcessing(true)
        const verifyUploadResponse = await verifyUpload(fileNames, uploadID)
        if(verifyUploadResponse == false){
          throw new Error("Upload not verified")
        }
        const postUploadResponse = await postUpload(uploadID)
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
        setDisabledViewSelected(true)
        setFilesSizeExceededColor(false)
        setUploadSize('0 KB')
        setSelectedFiles([])
        setBatchCount(0)
        setTotalBatch(0)
        setWillShareEmail(false)
        setRealtimeInitiating(false)
      }
    }
  }

  const initiateFilesUpload = async(files) => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const jwtToken = await appwriteService.getJWTToken()


    let fileNames = []
    let fileLength = 0
    
    for(const file of files) {
      fileNames.push(file.name)
      fileLength += file.size
    }

    const initiateUploadJSON = {
      file_names: fileNames,
      share_email_as_source: true,
    }

    const initiateUploadResponse = await fetch(
      apiBaseURL + '/upload/initiate',
      {
        method: 'POST',
        body: JSON.stringify(initiateUploadJSON),
        headers: {
          'File-Length': fileLength.toString(),
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'X-Auth-Token': 'Bearer ' + jwtToken.jwt,
        },
      },
    )
    const data = await initiateUploadResponse.json()
    const uploadID = data.upload_id
    const uploadURLs = data.upload_urls
    
    return { uploadID, uploadURLs }
  }

  const verifyUpload = async (fileNames, uploadID) => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const jwtToken = await appwriteService.getJWTToken()

    const fileJSON = {
      file_names: fileNames,
      receiver_email: receiverEmail,
    }
    const verifyUploadResponse = await fetch(
      apiBaseURL + '/upload/verify' + '/' + uploadID,
      {
        method: 'POST',
        body: JSON.stringify(fileJSON),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'X-Auth-Token': 'Bearer ' + jwtToken.jwt,
        },
      },
    )
    const statusCode = verifyUploadResponse.status
    if(statusCode == 400){
      return false
    }

    return true
  }

  const postUpload = async (uploadID) => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const jwtToken = await appwriteService.getJWTToken()

    const fileJSON = {
      receiver_email: receiverEmail,
    }
    const postUploadResponse = await fetch(
      apiBaseURL + '/upload/finalise' + '/' + uploadID,
      {
        method: 'POST',
        body: JSON.stringify(fileJSON),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'X-Auth-Token': 'Bearer ' + jwtToken.jwt,
        },
      },
    )
    const data = await postUploadResponse.json()
    const shareURL = data.url
    const shareQR = data.QR
    const downloadsAllowed = data.downloads_allowed

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const expirationDate = formatInTimeZone(
      data.expiration_date,
      userTimezone,
      'yyyy-MM-dd HH:mm:ss zzz',
    )

    return { shareURL, shareQR, expirationDate, downloadsAllowed }
  }

  function onRemove(index: number) {
    if (!selectedFiles) return
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    handleUploadChange?.(newFiles)
  }

  const FileCard = ({ file, onRemove }) => {
    return (
      <div className="relative flex items-center space-x-4">
        <div className="flex flex-1 space-x-4">
          <div className="flex w-full flex-col gap-2">
            <div className="space-y-px">
              <p className="line-clamp-1 text-sm font-medium text-foreground/80">
                {truncateFileName(file.name)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.size)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            onClick={onRemove}
          >
            <Cross2Icon className="size-4 " aria-hidden="true" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      </div>
    )
  }

  const truncateFileName = (fileName) => {
    const extensionIndex = fileName.lastIndexOf('.')
    const extension = fileName.slice(extensionIndex)
    let truncatedName = fileName.slice(0, extensionIndex)

    if (truncatedName.length > 18) {
      truncatedName = truncatedName.slice(0, 18) + '...'
    }

    return truncatedName + extension
  }

  return (
    <div className="bg-darkbg min-h-screen flex flex-col">
      <h1 className="sr-only">ByteShare</h1>
      <Header
        authorised={authorised}
        statusLoaded={statusLoaded}
        name={userName}
        email={userEmail}
      />
      {/* <p className="flex align-items-center z-10">hey</p> */}
      <Drawer open={isDrawerOpen} onClose={handleDrawerClose}>
        <div
          style={{ height: 'calc(100vh - 130px)' }}
          className="mt-0 flex flex-col items-center justify-center md:flex-row md:justify-around"
        >
          <div className="flex flex-col mb-4 text-center items-center justify-center">
            <span className="flex flex-col items-center text-white text-xl sm:text-xl md:text-xl lg:text-xl xl:text-xl ">
              <div className="hidden md:block">
                <Image src={DesktopHero} className="w-full" alt="we svg" />
              </div>
              <div className="block md:hidden">
                <Image src={MobileHero} className="w-full" alt="we svg" />
              </div>
              <HeroHighlight>
                <motion.h1
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: [20, -5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.4, 0.0, 0.2, 1],
                  }}
                  className="px-4 text-xs md:text-base lg:text-lg font-bold text-white dark:text-white max-w-xl leading-relaxed lg:leading-snug text-center mx-auto"
                >
                  Experience seamless file sharing with ByteShare.
                  <br />
                  <span className="block sm:inline-block mr-1">
                    Send files effortlessly,{' '}
                  </span>
                  <Highlight className="text-black dark:text-white block sm:inline-block">
                    keeping data safe and manageable.
                  </Highlight>
                </motion.h1>
              </HeroHighlight>
            </span>
          </div>
          <DrawerTrigger asChild>
            {/* <div className="px-12 py-8 border-2 border-black rounded-2xl"> */}
            <Button
              className="group animate-bounce font-semibold text-3xl shadow-2 py-10 bg-primary text-gray-100 hover:pointer hover:bg-blue-900 hover:text-white rounded-2xl hover:animate-none hover:opacity-80 z-10"
              onClick={() => handleSend()}
              disabled={sendDisabled}
            >
              SEND
              <span>
                <Image
                  className="w-10  sm:w-12  ml-2 lg:w-15 animate-heartbeat opacity-80 hover:animate-none"
                  src={Boxi}
                  alt="box"
                />
              </span>
            </Button>

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
                    You can select multiple files to share upto 2GB (max 1000 files).
                  </DrawerDescription>
                </>
              )}
            </DrawerHeader>{' '}
            {!uploading && !uploaded ? (
              <>
                <form onSubmit={handleUploadSubmit}>
                  <div className="p-2">
                    <Label
                      htmlFor="files"
                      className={`${filesSizeExceededColor ? 'text-red-500' : 'text-black'}`}
                    >
                      Size: {uploadSize}, {selectedFiles.length} files
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            disabled={disabledViewSelected}
                            className="px-2"
                          >
                            View selected
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-md">
                          <DialogHeader>
                            <DialogTitle>View Selected</DialogTitle>
                            <DialogDescription>
                              {selectedFiles.length} file ({uploadSize}){' '}
                              <Button
                                variant="link"
                                onClick={() => fileAddRef.current.click()}
                                className="px-1"
                              >
                                Add More
                              </Button>
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-fit w-full px-3">
                            <div className="max-h-48 space-y-4">
                              {selectedFiles?.map((file, index) => (
                                <FileCard
                                  key={index}
                                  file={file}
                                  onRemove={() => onRemove(index)}
                                />
                              ))}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </Label>
                    <Dropzone
                      onDrop={handleUploadChange}
                      multiple
                      disabled={realtimeInitiating}
                    >
                      {({ getRootProps, getInputProps, isDragActive }) => (
                        <div
                          {...getRootProps()}
                          className={cn(
                            'group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
                            'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isDragActive && 'border-muted-foreground/50',
                            // className,
                          )}
                        >
                          <input {...getInputProps()} />
                          {isDragActive ? (
                            <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                              <div className="rounded-full border border-dashed p-3">
                                <UploadIcon
                                  className="size-7 text-muted-foreground"
                                  aria-hidden="true"
                                />
                              </div>
                              <p className="font-normal text-muted-foreground">
                                Drop the files here
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                              <div className="rounded-full border border-dashed p-3">
                                <UploadIcon
                                  className="size-7 text-muted-foreground"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="space-y-px">
                                <p className="font-normal text-muted-foreground">
                                  Drag {`'n'`} drop files or folder here, or
                                  click to select files
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Dropzone>

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
                  {batchCount == 0 && progress == 0 && totalBatch > 100 ? (
                    <LoadingText text="Initialising upload" />
                  ) : !postProcessing ? (
                    <Label>
                      {progress.toFixed(1)}% ({batchCount}/{totalBatch} batch)
                    </Label>
                  ) : (
                    <LoadingText text="Processing" />
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

      <Image
        style={{ position: 'absolute', right: '0' }}
        src={Waves}
        alt="box"
      />
      <input
        type="file"
        ref={fileAddRef}
        style={{ display: 'none' }}
        onChange={handleAddFile}
        multiple
      />
      {/* <div className="absolute inset-0">
        <Image
          src="/background.jpg"
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
      </div> */}
    </div>
  )
}
