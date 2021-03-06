import Link from 'next/link';

export default function Hiring() {

  return (
    <>
      <img className="hiringLogo" src="/webaverse.png" />
      <div className="hiringContainer">
        <div>
          <h2>Why Webaverse?</h2>
          <p>
            After 7 years of metaverse experiments, we have all of the key pieces in place to build the metaverse.
            For many years, there has been a value void for creators creating amazing virtual world content.
            <br />
            <br />
            We are solving this by riding the growing wave of NFT and cryptoart, synthesizing a new asset class of 3d items that live across virtual worlds.
          </p>
        </div>
        <div>
          <h2>What is Webaverse?</h2>
          <p>
            Interactive items that live in a virtual world, built on open standards, that you truly own, with an engaging game-like experience.
            <br />
            <br />
            Webaverse is not only a foundation for an open, functional metaverse economy. We are looking at the best ideas from the most popular games right now so that it is an experience that is fun and one that you will spend a lot of time in.
            <br />
            <br />
            The architecture of Webaverse is following the trajectory to "Web3". Item ownership and provenance is on the Ethereum blockchain, files are hosted on IPFS (Interplanetary File System), and the interface is built on existing open web standards.
          </p>
        </div>
        <div>
          <h2>Why work here?</h2>
          <p>
            You will be working directly with the founders, with 30 years of industry experience between us.
            You will be working on the forefront of digital culture and science fiction made real.
            <br />
            <br />
            This is a full time position. We offer stock options and benefits.
          </p>
        </div>
        <div>
          <h2>Roles</h2>
          <p>If a role interests you, just click to learn more.</p>
          <ul>
            <li><Link href="/hiring/3dengineer"><a>3D Engineer</a></Link></li>
            <li><Link href="/hiring/blockchainengineer"><a>Blockchain Engineer</a></Link></li>
            <li><Link href="/hiring/infrastructureengineer"><a>Infrastructure Engineer</a></Link></li>
            <li><Link href="/hiring/shaderartist"><a>Shader Artist</a></Link></li>
            <li><Link href="/hiring/avatarartist"><a>Avatar Artist</a></Link></li>
            <li><Link href="/hiring/environmentartist"><a>Environment Artist</a></Link></li>
            <li><Link href="/hiring/artist"><a>Artist</a></Link></li>
            <li><Link href="/hiring/tester"><a>Tester</a></Link></li>
          </ul>
        </div>
        <div>
          <h2>Interested?</h2>
          <p>Send us an email at <a href="mailto:hello@webaverse.com">hello@webaverse.com</a></p>
          <p>or join our Discord <a target="_blank" href="https://discord.gg/R5wqYhvv53">here</a>.</p>
        </div>
      </div>
    </>
  )
}
