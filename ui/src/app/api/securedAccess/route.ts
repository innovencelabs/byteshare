import { STS, config as awsConfig } from 'aws-sdk'
import aws4 from 'aws4'
import { NextResponse } from 'next/server'

const REGION = process.env.AWS_REGION
const ROLE_ARN = process.env.ROLE_ARN

awsConfig.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: REGION,
})

const sts = new STS({region: REGION});


export async function POST(request: Request) {
    const data = await request.json()

    const { REGION, AccessKeyId, SecretAccessKey, SessionToken } = await getToken()
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    const url = new URL(data["apiURL"])
    const opts = {
        host: url.host,
        path: url.pathname + url.search,
        service: 'execute-api',
        region: REGION,
        method: data["method"],
        headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'X-Auth-Token': 'Bearer ' + data["jwtToken"],
        'X-Amz-Security-Token': SessionToken,
        },
    }

    
    aws4.sign(opts, {
        accessKeyId: AccessKeyId,
        secretAccessKey: SecretAccessKey,
        sessionToken: SessionToken,
    })
    
    return NextResponse.json({
        "headers": opts.headers
    })
}


const getToken = async () => {
    const params = {
    RoleArn: ROLE_ARN,
    RoleSessionName: 'AssumeRoleSession',
    DurationSeconds: 3600,
    };

    const data = await sts.assumeRole(params).promise()

    const { AccessKeyId, SecretAccessKey, SessionToken } = data.Credentials;  
    
    return {REGION, AccessKeyId, SecretAccessKey, SessionToken}
}