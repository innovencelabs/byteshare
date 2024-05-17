import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import GitHubButton from 'react-github-btn'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'

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
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
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
        'x-api-key': apiKey,
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
      <div className="flex flex-wrap items-center justify-between md:mx-10 p-3 sm:mx-auto">
        <Button
          onClick={() => router.push('/')}
          variant="ghost"
          className="flex items-center space-x-2 rtl:space-x-reverse hover:bg-transparent"
        >
          <Image
            src="/byteshare-white.png"
            alt="ByteShare Logo"
            width={32}
            height={32}
          />
          <span className="hidden sm:block self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            ByteShare
          </span>
        </Button>
        <div className="flex md:order-2 space-x-2 md:space-x-0 rtl:space-x-reverse">
          {statusLoaded ? (
            <span className="text-black hidden lg:flex focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-2 mx-2 py-1 text-center">
              <GitHubButton
                href="https://github.com/innovencelabs/ByteShare"
                data-icon="octicon-star"
                data-size="large"
                data-show-count="false"
                aria-label="Star innovencelabs/byteshare on GitHub"
              >
                Star
              </GitHubButton>
            </span>
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
                <Button variant="outline" className="text-xs md:text-sm">
                  {getFormattedName(name)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="text-xs font-medium select-none">
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
                  className="cursor-pointer"
                  onClick={() => router.push('/auth/logout')}
                >
                  Logout
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
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-cta"
        >
          {!statusLoaded ? (
            <></>
          ) : (
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
                            onChange={(e) => setFeedbackMessage(e.target.value)}
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
                  onClick={() => router.push('/docs/developers')}
                  className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                >
                  Developers
                </Button>
              </li>
              {authorised ? (
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/history')}
                    className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    History
                  </Button>
                </li>
              ) : (
                <></>
              )}
              {authorised ? (
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
              ) : (
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/upgrade')}
                    className="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Pricing
                  </Button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </nav>
  )
}
