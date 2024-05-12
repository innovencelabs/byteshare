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
import useAuth from '@/context/useAuth'
import { useEffect, useState } from 'react'

function DeveloperPage() {
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  
  const { authorised, statusLoaded } = useAuth()

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
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
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
                    {/* Adjusted alignment for small screens */}
                    <p className="font-medium">Your API Key: </p>
                    <p className="font-mono text-gray-500 dark:text-gray-400 pl-1">
                      xxxx-xxxx-xxxx-xxxx
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-600"
                  >
                    Revoke
                  </Button>
                  <Button size="sm" variant="default">
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
                  <h3 className="text-lg font-semibold mb-2">Health Routes</h3>
                  <div className="grid gap-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="health-1">
                        <AccordionTrigger>
                          <span className="bg-blue-100 text-left border border-blue-600 outline-none w-[95%] text-blue-600 p-3 rounded-sm mx-0 text-sm">
                            GET /health
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          Description of the API.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Upload Routes</h3>
                  <div className="grid gap-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="upload-1">
                        <AccordionTrigger>
                          <span className="bg-green-100 text-left border border-green-600 outline-none w-[95%] text-green-600 p-3 rounded-sm mx-0 text-sm">
                            POST /upload/initiate
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
          </section>
        </div>
      </main>
      {/* <Image
        style={{ position: 'absolute', right: '0' }}
        src={Waves}
        alt="box"
      /> */}
    </div>
  )
}

export default DeveloperPage
