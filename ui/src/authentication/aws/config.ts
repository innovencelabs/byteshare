import { STS, config as awsConfig } from 'aws-sdk';

const REGION = process.env.NEXT_PUBLIC_AWS_REGION
const ROLE_ARN = process.env.NEXT_PUBLIC_ROLE_ARN

awsConfig.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: REGION,
});


const sts = new STS({region: REGION});


export const getToken = async () => {
    const params = {
    RoleArn: ROLE_ARN,
    RoleSessionName: 'AssumeRoleSession',
    DurationSeconds: 3600,
    };

    const data = await sts.assumeRole(params).promise()

    const { AccessKeyId, SecretAccessKey, SessionToken } = data.Credentials;  
    
    return {REGION, AccessKeyId, SecretAccessKey, SessionToken}
}