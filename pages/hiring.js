import Link from 'next/link';

export default function Hiring() {

  return (
    <>
      <img className="hiringLogo" src="/webaverse.png" />
      <div className="hiringContainer">
        <div>
          <h2>Why Webaverse?</h2>
          <p>
            We're inspired to build the actual metaverse on the web. We're VC funded and actively hiring.<br/>
            The tech is 7 years in the making, and it's open source.<br/>
            You can log in and chop down your friend's garden with your laser sword.<br/>
            You can upload your avatar to Discord and dance your visemes off in the VR mirror.<br/>
            You can use the Blender plugin to export a digital pet and feed it your cryptoart.<br/>
            You can walk seamlessly between Cryptovoxels to Decentraland and join a friend with a link.<br/>
            None of these are the metaverse. But when you get a group of people together to do this, it might turn into one.<br/>
            Webaverse grows with cryptoart that becomes a permanent fixure of the world we're building.<br/>
            If you feel the same, you should join us.<br/>
            <br />
          </p>
        </div>
        <div>
          <h2>Environment FAQ</h2>
          <p>
            Q: Are you destroying the environment with NFTs?
            A: No, we run an ETH sidechain. It's basically a database you can replicate with ETH tools. Transactions are fast and free, necessary ingredients for a virtual world where chests and monsters can drop crypto loot. We remain compatible with ETH during its transition to proof of stake.
          </p>
          <h2>What is Webaverse?</h2>
          <p>
            Interactive items that live in a virtual world, built on open standards, that you truly own, with a fun game-like experience.
            <br />
            <br />
            We are looking at the best ideas from the most popular games right now so that it is an experience that is fun and one that you will spend a lot of time in while we collectively build an open, functional metaverse economy..
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
            These are full time positions. You are early -- we offer stock.
          </p>
        </div>
        <div>
          <h2>Roles</h2>
          <p>Here are roles we need filled. The ideal candidate has unique cross-cutting experience, like we do.</p>
          <ul>
            <li><Link href="/hiring/gameengineer"><a>WebGL Game Engineer</a></Link></li>
            <li><Link href="/hiring/frontendengineer"><a>Frontend engineer (React)</a></Link></li>
            <li><Link href="/hiring/designer"><a>Brand Designer</a></Link></li>
            <li><Link href="/hiring/blockchainengineer"><a>Blockchain Engineer</a></Link></li>
            <li><Link href="/hiring/infrastructureengineer"><a>Infrastructure Engineer</a></Link></li>
            <li><Link href="/hiring/avatarartist"><a>Avatar Artist</a></Link></li>
            <li><Link href="/hiring/userexperience"><a>User Experience Lead</a></Link></li>
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
