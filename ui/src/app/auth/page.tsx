"use client"

import { useRouter } from "next/navigation";


function Auth() {
    const router = useRouter();
    router.push('/auth/login');
    return <></>;
}

export default Auth