'use client'
import appwriteService from '@/authentication/appwrite/config'
import { Header } from '@/components/header'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import useAuth from '@/context/useAuth'
import { CheckIcon, CopyIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function DeveloperPage() {
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [apiKeyChangeLoading, setAPIKeyChangeLoading] = useState(false)
  const [apiKeyExist, setApiKeyExist] = useState(false)
  const [openAPIKeyDialog, setOpenAPIKeyDialog] = useState(false)
  const [apiKey, setApiKey] = useState('')
  
  const { authorised, statusLoaded } = useAuth()

  const apiURL = "https://api.byteshare.io"

  const router = useRouter()

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try{
        const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
        const apiKey = process.env.NEXT_PUBLIC_API_KEY
        const jwtToken = await appwriteService.getJWTToken()

        const apiKeyExistResponse = await fetch(apiBaseURL + '/secured/developer/apikey', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            Authorization: 'Bearer ' + jwtToken.jwt,
          },
        })
        if (!apiKeyExistResponse.ok) {
          toast.error('User ID is not valid')
          setIsLoading(false)
          return
        }
        const responseData = await apiKeyExistResponse.json()
        setApiKeyExist(responseData.exist)
      } catch (err){
        toast.error('Error checking API Key.')
      } finally {
        setIsLoading(false)
      }
      
      
    }
    fetchData()
  }, [])

  const handleRevokeAPIKey = async (e) => {
    e.preventDefault()
    const revokeInprogressToastID = toast.loading('Revoking API key...', {
      duration: 9999999,
    })
    setAPIKeyChangeLoading(true)
    try {
      const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      const jwtToken = await appwriteService.getJWTToken()

      const apiKeyRevokeResponse = await fetch(
        apiBaseURL + '/secured/developer/apikey',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            Authorization: 'Bearer ' + jwtToken.jwt,
          },
        },
      )
      if (!apiKeyRevokeResponse.ok) {
        toast.error('User ID is not valid')
        return
      }

      const responseData = await apiKeyRevokeResponse.json()
      setApiKeyExist(false)
      toast.dismiss(revokeInprogressToastID)
      toast.success('API key revoked successfully')
    } catch (err) {
      toast.dismiss(revokeInprogressToastID)
      toast.error('Error revoking API Key.')
    } finally {
      setAPIKeyChangeLoading(false)
    }
    
  }

  const handleGenerateAPIKey = async (e) => {
    e.preventDefault()
    const generateInprogressToastID = toast.loading('Generating API key...', {
      duration: 9999999,
    })
    setAPIKeyChangeLoading(true)
    try{
      const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      const jwtToken = await appwriteService.getJWTToken()

      const apiKeyResponse = await fetch(
        apiBaseURL + '/secured/developer/apikey',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            Authorization: 'Bearer ' + jwtToken.jwt,
          },
        },
      )
      if (!apiKeyResponse.ok) {
        toast.error('User ID is not valid')
        return
      }

      const responseData = await apiKeyResponse.json()
      setApiKeyExist(true)
      setApiKey(responseData.api_key)
      setOpenAPIKeyDialog(true)
      toast.dismiss(generateInprogressToastID)
    } catch (err) {
      toast.dismiss(generateInprogressToastID)
      toast.error('Error generating API Key.')
    } finally{
      setAPIKeyChangeLoading(false)
    }
    
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }
  
  return (
    <div className="w-screen bg-black">
      <Header
        authorised={authorised}
        statusLoaded={statusLoaded}
        name={userName}
        email={userEmail}
      />
      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <header className="text-white mb-8 md:mb-12">
          <h1 className=" text-3xl font-bold tracking-tight mb-2">
            ByteShare API Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Securely manage your API key and access comprehensive API
            documentation.
          </p>
        </header>
        <div className="grid gap-8 md:gap-12">
          <section>
            <h2 className="text-white text-2xl font-bold tracking-tight mb-4">
              API Key
            </h2>
            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
              {!statusLoaded ? (
                <>
                  <Skeleton className="ml-[20%] mb-2 h-4 w-[60%]" />
                  <Skeleton className="ml-[20%]  mb-2 h-4 w-[60%]" />
                </>
              ) : !authorised ? (
                <div className="flex flex-col md:flex-row md:items-center justify-center">
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push('/auth/login')}
                    >
                      Sign in to Generate API Key
                    </Button>
                  </div>
                </div>
              ) : isLoading ? (
                <>
                  <Skeleton className="ml-[20%] mb-2 h-4 w-[60%]" />
                  <Skeleton className="ml-[20%]  mb-2 h-4 w-[60%]" />
                </>
              ) : apiKeyExist ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <svg
                      className="h-6 w-6 text-gray-500 dark:text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="7.5" cy="15.5" r="5.5" />
                      <path d="m21 2-9.6 9.6" />
                      <path d="m15.5 7.5 3 3L22 7l-3-3" />
                    </svg>
                    <div className="flex flex-col md:flex-row items-start md:items-center">
                      {' '}
                      {/* <p className="font-medium">API Key:</p> */}
                      <p className="font-mono select-none">
                        **********************
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-600"
                      onClick={handleRevokeAPIKey}
                      disabled={apiKeyChangeLoading}
                    >
                      Revoke
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-black hover:bg-slate-700"
                      onClick={handleGenerateAPIKey}
                      disabled={apiKeyChangeLoading}
                    >
                      <svg
                        className="mr-1"
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43716 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43716 14.15 7.49998 14.15C9.44382 14.15 11.0622 13.3808 12.2145 12.2084C12.8315 11.5806 13.3133 10.839 13.6418 10.0407C13.7469 9.78536 13.6251 9.49315 13.3698 9.38806C13.1144 9.28296 12.8222 9.40478 12.7171 9.66014C12.4363 10.3425 12.0251 10.9745 11.5013 11.5074C10.5295 12.4963 9.16504 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-center">
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      size="sm"
                      variant="link"
                      onClick={handleGenerateAPIKey}
                    >
                      Generate API Key
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
          <section>
            <h2 className="text-white text-2xl font-bold tracking-tight mb-4">
              API Documentation
            </h2>
            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Introduction</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This comprehensive API documentation empowers you to
                    seamlessly access and manipulate your data programmatically.
                    We will guide you through the available endpoints, request
                    and response formats, along with other crucial details to
                    ensure a smooth integration experience.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    To authenticate your API requests, include your API key in
                    the
                    <code className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50 px-2 py-1 rounded-md font-mono">
                      X-API-KEY
                    </code>
                    header of your requests.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                  <p className="text-slate-600 dark:text-slate-600">
                    {apiURL}{' '}
                    <Button
                      type="submit"
                      size="sm"
                      className="ml-2 p-2 bg-black hover:bg-slate-700"
                      onClick={() => handleCopy(apiURL)}
                    >
                      <span className="sr-only">Copy</span>
                      {!isCopied ? (
                        <CopyIcon className="h-3 w-3" />
                      ) : (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </Button>
                  </p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Endpoints</h2>
                  <div>
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold mb-2">
                        Health Routes
                      </h3>
                      <div className="grid gap-2">
                        <Accordion
                          type="single"
                          collapsible
                          className="bg-blue-100 border border-blue-600  px-2 w-full rounded-sm"
                        >
                          <AccordionItem value="health-1">
                            <AccordionTrigger>
                              <span className="text-left outline-none w-[95%] text-blue-600 p-1 mx-0 font-semibold">
                                <span className="bg-blue-600 py-1 px-3 rounded-sm text-white mr-2">
                                  GET
                                </span>
                                /health
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              Description of the API.
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold mb-2">
                        Upload Routes
                      </h3>
                      <div className="grid gap-2">
                        <Accordion
                          type="single"
                          collapsible
                          className="bg-green-100 border border-green-600  px-2 w-full rounded-sm"
                        >
                          <AccordionItem value="upload-1">
                            <AccordionTrigger>
                              <span className="text-left outline-none w-[95%] text-green-600 p-1 mx-0 font-semibold">
                                <span className="bg-green-600 py-1 px-3 rounded-sm text-white mr-2">
                                  POST
                                </span>
                                /upload/initiate
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              Description of the API.
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        <Accordion
                          type="single"
                          collapsible
                          className="bg-green-100 border border-green-600  px-2 w-full rounded-sm"
                        >
                          <AccordionItem value="upload-2">
                            <AccordionTrigger>
                              <span className="text-left outline-none w-[95%] text-green-600 p-1 mx-0 font-semibold">
                                <span className="bg-green-600 py-1 px-3 rounded-sm text-white mr-2">
                                  POST
                                </span>
                                /upload/finalise/[upload_id]
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              Description of the API.
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        <Accordion
                          type="single"
                          collapsible
                          className="bg-red-100 border border-red-600  px-2 w-full rounded-sm"
                        >
                          <AccordionItem value="upload-3">
                            <AccordionTrigger>
                              <span className="text-left outline-none w-[95%] text-red-600 p-1 mx-0 font-semibold">
                                <span className="bg-red-600 py-1 px-3 rounded-sm text-white mr-2">
                                  DELETE
                                </span>
                                /upload/[upload_id]
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              Description of the API.
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        <Accordion
                          type="single"
                          collapsible
                          className="bg-orange-100 border border-orange-600  px-2 w-full rounded-sm"
                        >
                          <AccordionItem value="upload-4">
                            <AccordionTrigger>
                              <span className="text-left outline-none w-[95%] text-orange-600 p-1 mx-0 font-semibold">
                                <span className="bg-orange-600 py-1 px-3 rounded-sm text-white mr-2">
                                  PUT
                                </span>
                                /upload/[upload_id]/title
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              Description of the API.
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        <Accordion
                          type="single"
                          collapsible
                          className="bg-blue-100 border border-blue-600  px-2 w-full rounded-sm"
                        >
                          <AccordionItem value="upload-5">
                            <AccordionTrigger>
                              <span className="text-left outline-none w-[95%] text-blue-600 p-1 mx-0 font-semibold">
                                <span className="bg-blue-600 py-1 px-3 rounded-sm text-white mr-2">
                                  GET
                                </span>
                                /upload/history
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              Description of the API.
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold mb-2">
                        Download Routes
                      </h3>
                      <div className="grid gap-2">
                        <Accordion
                          type="single"
                          collapsible
                          className="bg-blue-100 border border-blue-600  px-2 w-full rounded-sm"
                        >
                          <AccordionItem value="download-1">
                            <AccordionTrigger>
                              <span className="text-left outline-none w-[95%] text-blue-600 p-1 mx-0 font-semibold">
                                <span className="bg-blue-600 py-1 px-3 rounded-sm text-white mr-2">
                                  GET
                                </span>
                                /download/[upload_id]
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              Description of the API.
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Dialog
        open={openAPIKeyDialog}
        onOpenChange={() => {
          setOpenAPIKeyDialog(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="select-none">
              Your API key is generated
            </DialogTitle>
            <DialogDescription className="select-none">
              Please store it securely, as it will only be displayed once.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" defaultValue={apiKey} readOnly />
            </div>
            <Button
              type="submit"
              size="sm"
              className="px-3 bg-black hover:bg-slate-700"
              onClick={() => handleCopy(apiKey)}
            >
              <span className="sr-only">Copy</span>
              {!isCopied ? (
                <CopyIcon className="h-4 w-4" />
              ) : (
                <CheckIcon className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="default"
              className="bg-black hover:bg-slate-700 justify-end"
            >
              Download CSV
            </Button>
            
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* <Image
        style={{ position: 'absolute', right: '0' }}
        src={Waves}
        alt="box"
      /> */}
    </div>
  )
}

export default DeveloperPage
