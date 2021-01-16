import Image from 'next/image'

export default function FourOhFour() {

  return (
    <>
      <h1 style={{ fontSize: "3rem" }}>404</h1>
      <h2>Page not found.</h2>
      <div>
        <Image src="/404.png" width={121} height={459} />
      </div>
    </>
  )
}
