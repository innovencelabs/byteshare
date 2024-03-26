import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import appwriteService from '@/authentication/appwrite/config'

export const Header = ({ authorised, statusLoaded, name, email }) => {
  const [feedbackName, setFeedbackName] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/flowbite@1.5.1/dist/flowbite.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault()
    setPopoverOpen(false)

    const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    const feedbackJSON = {
      name: feedbackName,
      email: feedbackEmail,
      message: feedbackMessage,
    }

    await fetch(apiBaseURL + '/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackJSON),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    toast.success('Your feedback has been received.😃')
  }

  const getFormattedName = (name, maxLength = 8) => {
    const words = name.split(' ')
    
    let firstWord = words[0]

    if (firstWord.length > maxLength) {
      firstWord = firstWord.substring(0, maxLength - 2) + '..'
    }

      return firstWord
  }

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 z-10">
      <div className="flex flex-wrap items-center justify-between md:mx-10 p-4 sm:mx-auto">
        <Button
          onClick={() => router.push('/')}
          variant="ghost"
          className="flex items-center space-x-3 rtl:space-x-reverse hover:bg-transparent"
        >
          {/* <Image
            src="/images/logo.svg"
            alt="ByteShare Logo"
            width={32}
            height={32}
          /> */}
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            ByteShare
          </span>
        </Button>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {statusLoaded ? (
            <Button
              variant="ghost"
              className="text-black hidden lg:flex focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 mx-2 text-center"
              aria-label="Star this repository on GitHub"
              onClick={() =>
                window.open(
                  'https://github.com/ambujraj/byteshare/stargazers',
                  '_blank',
                )
              }
            >
              <svg
                width="15"
                height="15"
                className="mr-2"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Star on GitHub
            </Button>
          ) : (
            <></>
          )}
          {!authorised && statusLoaded ? (
            <Button
              onClick={() => router.push('/auth/login')}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              disabled={!statusLoaded}
            >
              Sign In
            </Button>
          ) : statusLoaded ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-xs md:text-sm">{getFormattedName(name)}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="text-xs font-light">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuGroup>
                  <DropdownMenuItem className="font-bold cursor-pointer">
                    Account
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator /> */}

                <DropdownMenuItem
                  className="font-bold cursor-pointer"
                  onClick={() => router.push('/auth/logout')}
                >
                  <svg
                    width="15"
                    height="15"
                    className="mr-2"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 1C2.44771 1 2 1.44772 2 2V13C2 13.5523 2.44772 14 3 14H10.5C10.7761 14 11 13.7761 11 13.5C11 13.2239 10.7761 13 10.5 13H3V2L10.5 2C10.7761 2 11 1.77614 11 1.5C11 1.22386 10.7761 1 10.5 1H3ZM12.6036 4.89645C12.4083 4.70118 12.0917 4.70118 11.8964 4.89645C11.7012 5.09171 11.7012 5.40829 11.8964 5.60355L13.2929 7H6.5C6.22386 7 6 7.22386 6 7.5C6 7.77614 6.22386 8 6.5 8H13.2929L11.8964 9.39645C11.7012 9.59171 11.7012 9.90829 11.8964 10.1036C12.0917 10.2988 12.4083 10.2988 12.6036 10.1036L14.8536 7.85355C15.0488 7.65829 15.0488 7.34171 14.8536 7.14645L12.6036 4.89645Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>{' '}
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <></>
          )}
          <button
            data-collapse-toggle="navbar-cta"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-cta"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        {statusLoaded ? (
          authorised ? (
            <div
              className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
              id="navbar-cta"
            >
              <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                <li>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                      >
                        Feedback
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <form onSubmit={handleFeedbackSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor="name" className="text-left">
                              Name
                            </Label>
                            <Input
                              id="name"
                              value={feedbackName}
                              onChange={(e) => setFeedbackName(e.target.value)}
                              className="col-span-4"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor="email" className="text-left">
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={feedbackEmail}
                              onChange={(e) => setFeedbackEmail(e.target.value)}
                              className="col-span-4"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor="message" className="text-left">
                              Message<span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="message"
                              value={feedbackMessage}
                              onChange={(e) =>
                                setFeedbackMessage(e.target.value)
                              }
                              className="col-span-4"
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="flex justify-end">
                          Submit
                        </Button>
                      </form>
                    </PopoverContent>
                  </Popover>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/help')}
                    className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Help
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/history')}
                    className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    History
                  </Button>
                </li>
                <li>
                  <Button
                    variant="default"
                    onClick={() => router.push('/upgrade')}
                    className="
                block py-2 px-4
                text-white rounded
                hover:bg-blue-700
              "
                  >
                    Upgrade
                  </Button>
                </li>
              </ul>
            </div>
          ) : (
            <div
              className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
              id="navbar-cta"
            >
              <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                <li>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                      >
                        Feedback
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <form onSubmit={handleFeedbackSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor="name" className="text-left">
                              Name
                            </Label>
                            <Input
                              id="name"
                              value={feedbackName}
                              onChange={(e) => setFeedbackName(e.target.value)}
                              className="col-span-4"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor="email" className="text-left">
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={feedbackEmail}
                              onChange={(e) => setFeedbackEmail(e.target.value)}
                              className="col-span-4"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor="message" className="text-left">
                              Message<span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="message"
                              value={feedbackMessage}
                              onChange={(e) =>
                                setFeedbackMessage(e.target.value)
                              }
                              className="col-span-4"
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="flex justify-end">
                          Submit
                        </Button>
                      </form>
                    </PopoverContent>
                  </Popover>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/help')}
                    className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Help
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/upgrade')}
                    className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Pricing
                  </Button>
                </li>
              </ul>
            </div>
          )
        ) : (
          <></>
        )}
      </div>
    </nav>
  )
}
