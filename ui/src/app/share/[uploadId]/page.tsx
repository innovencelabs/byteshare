import React from 'react'

type Params = {
  params: {
    uploadId: string
  }
}

function SharePage({ params }: Params) {
  return <div>{params.uploadId}</div>
}

export default SharePage
