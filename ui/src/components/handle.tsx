import React from 'react'

function TwitterHandle() {
  return (
    <button
      onClick={() => window.open(`https://twitter.com/_ambujraj`, '_blank')}
      className="fixed bottom-4 right-0 md:right-0 lg:right-0 xl:right-0 my-0 bg-white text-black rounded-none py-2 px-2 text-xs flex items-center focus:outline-none hover:bg-white z-10"
    >
      {/* <TwitterLogoIcon className="mr-1 w-4 h-4" /> */}
      <span>@_ambujraj</span>
    </button>
  )
}

export default TwitterHandle
