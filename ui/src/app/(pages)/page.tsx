'use client'
import appwriteService from '@/authentication/appwrite/config'
import { Header } from '@/components/header'
import LoadingText from '@/components/loading'
import { Button } from '@/components/ui/button'
<<<<<<< HEAD
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
=======
import axios from 'axios'
import Dropzone from 'react-dropzone'
import { ScrollArea } from '@/components/ui/scroll-area'
import DesktopHero from 'public/Svgs/hero_desktop.svg'
import MobileHero from 'public/Svgs/hero_mobile.svg'

import Boxi from 'public/Svgs/box.svg'
import Waves from 'public/Svgs/waves.svg'
>>>>>>> 16948c4 (updated ui with some changes and  little animation improvement)
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import useAuth from '@/context/useAuth'
import { cn } from '@/lib/utils'
import {
  CheckIcon,
  CopyIcon,
  Cross2Icon,
  UploadIcon,
} from '@radix-ui/react-icons'
import axios from 'axios'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import Dropzone from 'react-dropzone'
import { toast } from 'sonner'

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
  const [filesSizeExceededColor, setFilesSizeExceededColor] = useState(false)
  const [disabledViewSelected, setDisabledViewSelected] = useState(true)
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

  const handleUploadChange = useCallback((files) => {
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
    } else if (totalSize >= 2 * 1024 * 1024 * 1024) {
      setUploadSize(
        (totalSize / (1024 * 1024 * 1024)).toFixed(2) +
          ' GB',
      )
      setSubmitDisabled(true)
      setFilesSizeExceededColor(true)
      setSelectedFiles(Array.from(files))
      return
    } else {
      setUploadSize(formatSize(totalSize))
    }
    setSelectedFiles(Array.from(files))
    setSubmitDisabled(false)
  }, [selectedFiles])

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
        setDisabledViewSelected(true)
        setFilesSizeExceededColor(false)
        setUploadSize('0 KB')
        setSelectedFiles([])
        setBatchCount(0)
        setTotalBatch(0)
        setWillShareEmail(false)
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
      creator_id: user['$id'],
      creator_email: userEmail,
      creator_ip: '127.0.0.1',
      share_email_as_source: true,
    }

    const initiateUploadResponse = await fetch(
      apiBaseURL + '/batchInitiateUpload',
      {
        method: 'POST',
        body: JSON.stringify(initiateUploadJSON),
        headers: {
          'File-Length': fileLength.toString(),
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          Authorization: 'Bearer ' + jwtToken.jwt,
        },
      },
    )
    const data = await initiateUploadResponse.json()
    const uploadID = data.upload_id
    const uploadURLs = data.upload_urls
    
    return { uploadID, uploadURLs }
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

    if (truncatedName.length > 12) {
      truncatedName = truncatedName.slice(0, 12) + '...'
    }

    return truncatedName + extension
  }

  return (
    <div className="bg-darkbg min-h-screen flex flex-col">
      <Header
        authorised={authorised}
        statusLoaded={statusLoaded}
        name={userName}
        email={userEmail}
      />
      {/* <p className="flex align-items-center z-10">hey</p> */}
      <Drawer open={isDrawerOpen} onClose={handleDrawerClose}>
        <div style={{height: "calc(100vh - 130px)"}} className="mt-0 flex flex-col items-center flex-col-reverse justify-center md:flex-row md:justify-around ">
          <DrawerTrigger asChild>
            {/* <div className="px-12 py-8 border-2 border-black rounded-2xl"> */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="group animate-bounce font-semibold text-3xl shadow-2 py-10 bg-primary text-gray-100 hover:pointer hover:bg-blue-900 hover:text-white rounded-2xl hover:animate-none hover:opacity-80"
                    onClick={() => handleSend()}
                    disabled={!statusLoaded}
                  >
                    SEND
                    <span>
                    <Image className="w-10  sm:w-12  ml-2 lg:w-15 animate-heartbeat opacity-80 hover:animate-none" src={Boxi} alt="box"/>
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-white text-black">
                  <p>Send files</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* </div> */}
          </DrawerTrigger>
          <div className="flex flex-col mb-4 text-center items-center justify-center">
            <span className="flex flex-col items-center text-white text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl ">
            <div className="hidden md:block">
                <Image src={DesktopHero} className="w-full" alt="we svg" />
             </div>
             <div className="block md:hidden">
                <Image src={MobileHero} className="w-full" alt="we svg" />
             </div>
              We help You share data
            </span>
            <p className="pl-5 text-primary text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-5xl ">
              Fast, <span className='text-white'>Secure </span><br/><p className='text-white text-3xl'>& </p>Effortless
            </p>
          </div>

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
                    <Label
                      htmlFor="files"
                      className={`${filesSizeExceededColor ? 'text-red-500' : 'text-black'}`}
                    >
                      Files (Size: {uploadSize})
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            disabled={disabledViewSelected}
                          >
                            View selected
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-md">
                          <DialogHeader>
                            <DialogTitle>View Selected</DialogTitle>
                            <DialogDescription>
                              {selectedFiles.length} file ({uploadSize})
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
                    <Dropzone onDrop={handleUploadChange} multiple>
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
                  {batchCount == 0 && progress == 0 && totalBatch>100 ? (
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
      
      <Image style={{position:'absolute', right:"0"}} src={Waves} alt="box"/>
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
