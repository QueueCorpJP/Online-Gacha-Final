import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function LineCallback() {
  const router = useRouter();
  const { code } = router.query;
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (code) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/line/callback?code=${code}`)
        .then((res) => res.json())
        .then((data) => {
          setUserId(data.userId);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [code]);

  return (
    <div>
      <h1>LINE Login Callback</h1>
      {loading ? <p>Loading...</p> : <p>User ID: {userId}</p>}
    </div>
  );
}
