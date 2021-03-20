import Link from 'next/link';

export default function Hiring() {

  return (
    <>
      <img className="hiringLogo" src="/webaverse.png" />
      <div className="hiringContainer">
        <div>
          <h2>Why Webaverse?</h2>
          <p>
            We're building the actual metaverse on the web. We're VC funded and actively hiring.
            The tech is 7 years in the making, and it's open source.
            You can log in and chop down trees with your laser sword.
            You can upload your avatar to Discord and dance your visemes off in the VR mirror.
            You can use the Blender plugin to export a digital pet and feed it your cryptoart.
            You can walk from Cryptovoxels to Decentraland and join a friend with a link.
            None of these are the metaverse. But when you get a group of people together to do this, it might turn into one.
            That's what we're doing and you should join us.
            Q: Are you destroying the environment with NFTs?
            A: No, we run a fast ETH sidechain. It's basically a database you can replicate with ETH tools, free for you and cheap for us. We remain compatible with ETH for the people who don't care about the environment (fair enough).
            <br />
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
