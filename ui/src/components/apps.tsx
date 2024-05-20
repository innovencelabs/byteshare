import Link from "next/link"

export function Apps() {
  const version = "v0.4.0"
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 text-center">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Get the Best Experience with Our App
          </h1>
          <p className="text-gray-500 md:text-xl dark:text-gray-400">
            Get the latest version of our app for your operating system. Choose
            from Windows, Linux, or macOS.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-6 py-6 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
            href="#"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="20"
              height="20"
              viewBox="0 0 48 48"
            >
              <path
                fill="#0077d4"
                d="M7,6h15c0.552,0,1,0.448,1,1v15c0,0.552-0.448,1-1,1H7c-0.552,0-1-0.448-1-1V7	C6,6.448,6.448,6,7,6z"
              ></path>
              <path
                fill="#0077d4"
                d="M25.042,21.958V7c0-0.552,0.448-1,1-1H41c0.552,0,1,0.448,1,1v14.958	c0,0.552-0.448,1-1,1H26.042C25.489,22.958,25.042,22.511,25.042,21.958z"
              ></path>
              <path
                fill="#0077d4"
                d="M7,25h15c0.552,0,1,0.448,1,1v15c0,0.552-0.448,1-1,1H7c-0.552,0-1-0.448-1-1V26	C6,25.448,6.448,25,7,25z"
              ></path>
              <path
                fill="#0077d4"
                d="M25,41V26c0-0.552,0.448-1,1-1h15c0.552,0,1,0.448,1,1v15c0,0.552-0.448,1-1,1H26	C25.448,42,25,41.552,25,41z"
              ></path>
            </svg>
            Windows {version}
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-6 py-6 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
            href="#"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="20"
              height="20"
              viewBox="0 0 48 48"
            >
              <linearGradient
                id="r2MxEK_crF4r_9KDH-FAGa_UjcGNVXknmz3_gr1"
                x1="8.977"
                x2="40.764"
                y1="-3.107"
                y2="53.191"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stop-color="#41474a"></stop>
                <stop offset="1" stop-color="#323538"></stop>
              </linearGradient>
              <path
                fill="url(#r2MxEK_crF4r_9KDH-FAGa_UjcGNVXknmz3_gr1)"
                d="M43,40H5c-1.105,0-2-0.895-2-2V9 c0-1.105,0.895-2,2-2h38c1.105,0,2,0.895,2,2v29C45,39.105,44.105,40,43,40z"
              ></path>
              <linearGradient
                id="r2MxEK_crF4r_9KDH-FAGb_UjcGNVXknmz3_gr2"
                x1="8.977"
                x2="40.764"
                y1="-3.107"
                y2="53.191"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stop-color="#eceff1"></stop>
                <stop offset="1" stop-color="#cfd8dc"></stop>
              </linearGradient>
              <path
                fill="url(#r2MxEK_crF4r_9KDH-FAGb_UjcGNVXknmz3_gr2)"
                d="M42,10v27H6V10H42 M43,7H5 C3.895,7,3,7.895,3,9v29c0,1.105,0.895,2,2,2h38c1.105,0,2-0.895,2-2V9C45,7.895,44.105,7,43,7L43,7z"
              ></path>
              <path
                d="M16.52,18.527c-0.384-0.414-0.955-0.772-1.737-1.089v-1.343c0.403,0.097,0.777,0.251,1.115,0.458 l0.761,0.467v-0.893v-1.624v-0.292l-0.254-0.143c-0.398-0.225-0.932-0.369-1.622-0.438V13v-0.5h-0.5h-0.87h-0.5V13v0.69 c-0.641,0.136-1.18,0.42-1.606,0.848C10.771,15.076,10.5,15.736,10.5,16.5c0,0.703,0.21,1.311,0.625,1.809 c0.357,0.427,0.944,0.806,1.788,1.154v1.265c-0.174-0.041-0.36-0.096-0.555-0.165c-0.401-0.141-0.697-0.288-0.881-0.439 l-0.817-0.668v1.055v1.666v0.302l0.267,0.141c0.618,0.325,1.284,0.521,1.985,0.586V24v0.5h0.5h0.87h0.5V24v-0.878 c0.684-0.139,1.239-0.411,1.653-0.811c0.521-0.502,0.785-1.164,0.785-1.968C17.22,19.638,16.985,19.027,16.52,18.527z"
                opacity=".05"
              ></path>
              <path
                d="M16.886,18.187c-0.381-0.411-0.908-0.766-1.604-1.079v-0.315c0.123,0.056,0.241,0.118,0.354,0.187 l0.761,0.467l0.762,0.467v-0.893v-0.893v-1.624v-0.292v-0.292l-0.254-0.143l-0.254-0.143c-0.366-0.207-0.816-0.352-1.368-0.442V13 v-0.5V12h-0.5h-0.5h-0.87h-0.5h-0.5v0.5V13v0.305c-0.567,0.18-1.057,0.475-1.46,0.88C10.32,14.821,10,15.6,10,16.5 c0,0.823,0.249,1.539,0.74,2.129c0.364,0.435,0.913,0.817,1.672,1.162v0.26c-0.375-0.141-0.548-0.255-0.619-0.314l-0.817-0.668 l-0.817-0.668v1.055v1.055v1.666v0.302v0.302l0.267,0.141l0.267,0.141c0.541,0.284,1.116,0.479,1.718,0.582V24v0.5V25h0.5h0.5h0.87 h0.5h0.5v-0.5V24v-0.487c0.6-0.176,1.103-0.459,1.5-0.843c0.622-0.6,0.937-1.383,0.937-2.327 C17.72,19.508,17.44,18.782,16.886,18.187z"
                opacity=".05"
              ></path>
              <path
                d="M41.5,10.5v26h-35v-26H41.5 M42,10H6v27h36V10L42,10z"
                opacity=".05"
              ></path>
              <rect width="36" height="27" x="6" y="10" fill="none"></rect>
              <path
                d="M41,11v25H7V11H41 M42,10H6v27h36V10L42,10z"
                opacity=".05"
              ></path>
              <polygon
                points="25,22.5 19,22.5 18.5,22.5 18.5,23 18.5,24 18.5,24.5 19,24.5 25,24.5 25.5,24.5 25.5,24 25.5,23 25.5,22.5"
                opacity=".05"
              ></polygon>
              <polygon
                points="25.5,22 25,22 19,22 18.5,22 18,22 18,22.5 18,23 18,24 18,24.5 18,25 18.5,25 19,25 25,25 25.5,25 26,25 26,24.5 26,24 26,23 26,22.5 26,22"
                opacity=".05"
              ></polygon>
              <g>
                <path
                  fill="#fff"
                  d="M14.283,22.695V24h-0.87v-1.269c-0.807-0.004-1.557-0.188-2.252-0.553v-1.666 c0.23,0.188,0.574,0.363,1.031,0.523c0.457,0.161,0.864,0.253,1.221,0.277v-2.189c-0.93-0.349-1.564-0.727-1.904-1.133 C11.17,17.582,11,17.086,11,16.5c0-0.63,0.22-1.166,0.661-1.609c0.441-0.443,1.025-0.7,1.752-0.773V13h0.87v1.095 c0.838,0.04,1.464,0.176,1.877,0.409v1.624c-0.556-0.341-1.182-0.549-1.877-0.625v2.279c0.87,0.317,1.493,0.679,1.871,1.086 c0.378,0.407,0.567,0.899,0.567,1.476c0,0.666-0.211,1.202-0.633,1.609C15.667,22.359,15.066,22.607,14.283,22.695z M13.413,17.432v-1.907c-0.552,0.1-0.829,0.391-0.829,0.872C12.584,16.811,12.861,17.156,13.413,17.432z M14.283,19.465v1.822 c0.568-0.088,0.852-0.375,0.852-0.86C15.134,20.035,14.851,19.714,14.283,19.465z"
                ></path>
              </g>
              <rect width="6" height="1" x="19" y="23" fill="#fff"></rect>
            </svg>
            Linux {version}
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-6 py-6 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
            href="#"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="20"
              height="20"
              viewBox="0 0 48 48"
            >
              <path
                fill="#0883d9"
                d="M36.232,23.985c0-5.865,4.766-8.51,4.966-8.636c-2.596-3.993-6.79-4.467-8.362-4.468	c-3.643,0-6.863,2.022-8.585,2.022c-1.797,0-4.418-2.121-7.363-2.022c-3.843,0.075-7.363,2.346-9.334,5.691	c-1.397,2.396-1.947,5.217-1.896,8.087c0.002,0.113,0.017,0.228,0.02,0.341H36.32C36.279,24.671,36.243,24.337,36.232,23.985z"
              ></path>
              <path
                fill="#0883d9"
                d="M30.565,7.063C32.261,5.191,33.21,2.621,33.06,0c-2.346,0-5.066,1.372-6.788,3.394	c-1.348,1.672-2.795,4.293-2.271,6.913C26.422,10.607,29.043,9.085,30.565,7.063z"
              ></path>
              <path
                fill="#0370c8"
                d="M17.511,45c2.771,0,3.794-1.848,7.413-1.848c3.37,0,4.418,1.848,7.338,1.848	c3.07,0,5.092-2.795,6.913-5.567c2.295-3.218,3.07-6.288,3.169-6.414c-0.094,0-5.287-2.112-6.026-8.019H5.678	c0.157,5.311,2.228,10.79,4.671,14.309C12.27,42.055,14.441,45,17.511,45z"
              ></path>
            </svg>
            macOS {version}
          </Link>
        </div>
      </div>
    </section>
  )
}
