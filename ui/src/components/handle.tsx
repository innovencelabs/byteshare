import React from 'react'

function TwitterHandle() {
  return (
    <button
      onClick={() => window.open(`https://twitter.com/_ambujraj`, '_blank')}
      className="fixed bottom-4 right-0 md:right-0 lg:right-0 xl:right-0 my-0 bg-white text-black rounded-none py-2 px-2 text-xs flex items-center focus:outline-none hover:bg-white z-10"
    >
      {/* <TwitterLogoIcon className="mr-1 w-4 h-4" /> */}
      <div className="mr-1 w-4 h-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 30 30"
        >
          <path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"></path>
        </svg>
      </div>
      <span>@_ambujraj</span>
    </button>
  )
}

export default TwitterHandle
