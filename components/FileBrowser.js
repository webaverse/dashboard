import React, { useState, useEffect } from "react";
import { getBlockchain, runSidechainTransaction } from "../webaverse/blockchain.js";
import Loader from "./Loader";
import wbn from "../webaverse/wbn.js";
import Clear from '@material-ui/icons/Clear';
import TextFields from '@material-ui/icons/TextFields';

const m = "Proof of address.";
const _getUrlForHashExt = (hash, name, ext) => `https://ipfs.exokit.org/ipfs/${hash}/${name}.${ext}`;
const _clone = o => JSON.parse(JSON.stringify(o));

class FileInput extends React.Component{
  componentDidMount(){
    this.nameInput.focus();
  }
  render() {
    return(
      <input type="text" ref={(input) => { this.nameInput = input; }}  {...this.props} />
    );
  }
}
const FileDrop2 = ({
  onDrop,
  children,
}) => {
  // console.log('got props', {children});
  return (
    <div className="file-drop"
      onDragOver={e => {
        console.log('on drag over');
        e.preventDefault();
      }}
      onDrop={e => {
        e.preventDefault();
        onDrop(e.dataTransfer.files, e);
      }}>
      <div className="file-drop-target"/>
      {children}
    </div>
  );
};
const BundleFileContents = ({
  name,
  ext,
  url,
  files,
  setFiles,
  currentHash,
  renamingFile,
  setRenamingFile,
}) => {
  const [loading, setLoading] = useState(false);
  const [lastUpdateHash, setLastUpdateHash] = useState(null);
  
  const _fileToFileSpec = file => {
    /* // const ext = getExt(file.name);
    const contentType = mime.getType(file.name) || 'application/octet-stream';
    const blob = new Blob([response.body], {
      type: contentType,
    }); */
    const blobUrl = URL.createObjectURL(file);
    // const {pathname} = new URL(blobUrl);
    return {
      pathname: `/${file.name}`,
      blob: file,
      blobUrl,
    };
  };
  
  // console.log('got hash 2', {currentHash, lastUpdateHash});
  if (currentHash !== lastUpdateHash) {
    (async () => {
      setLoading(true);

      try {      
        if (ext === 'wbn') {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();

          const fileSpecs = [];
          const bundle = new wbn.Bundle(arrayBuffer);
          const {urls} = bundle;

          for (const u of urls) {
            const response = bundle.getResponse(u);
            const {headers} = response;
            const contentType = headers['content-type'] || 'application/octet-stream';
            let blob = new Blob([response.body], {
              type: contentType,
            });
            blob = blobToFile(blob, u);
            const blobUrl = URL.createObjectURL(blob);
            const {pathname} = new URL(u);
            fileSpecs.push({
              pathname,
              blob,
              blobUrl,
            });
          }
          
          setFiles(fileSpecs);
        } else {
          const res = await fetch(url);
          const blob = await res.blob();
          blob.name = `${name}.${ext}`;
          const file = _fileToFileSpec(blob);
          setFiles([file]);
        }
      } catch(err) {
        console.warn(err);
      }

      setLoading(false);
    })();
    setLastUpdateHash(currentHash);
  }
  const _renameFile = (file, index) => {
    setRenamingFile(file === renamingFile ? null : file);
  };
  const _setFileName = (e, index) => {
    const oldFile = files[index];
    const newFile = _clone(oldFile);
    newFile.pathname = e.target.value;
    
    const newFiles = files.map(f => {
      if (f === oldFile) {
        return newFile;
      } else {
        return f;
      }
    });
    // console.log('got shape of file', newFiles);
    setFiles(newFiles);
    
    if (renamingFile === oldFile) {
      setRenamingFile(newFile);
    }
  };
  const _removeFile = (file, index) => {
    const localFiles = files.slice();
    localFiles.splice(index, 1);
    const newFiles = _clone(localFiles);
    setFiles(newFiles);
  };
  const _keyDown = e => {
    if (e.which === 13) {
      renamingFile && setRenamingFile(null);
    }
  };
  
  return (loading ?
    <Loader loading={loading} />
  :
    <div className="file">
      <FileDrop2
        onDrop={(fileList, e) => {
          e.preventDefault();
          
          console.log('uploaded', fileList);
          
          const fileSpecs = files.slice();
          for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const fileSpec = _fileToFileSpec(file);
            fileSpecs.push(fileSpec);
          }
          setFiles(fileSpecs);
          
          // console.log('got file drop', files);
        }}
      >
        <ul>
          {files.map((f, i) => (
            <li key={i}>
             {renamingFile === f ?
               <FileInput value={f.pathname} onChange={e => _setFileName(e, i)} onKeyDown={_keyDown} />
             :
               <a href={f.blobUrl} key={i}>{f.pathname}</a>
             }
             <nav onClick={() => _renameFile(f, i)}><TextFields/></nav>
             <nav onClick={() => _removeFile(f, i)}><Clear/></nav>
            </li>
          ))}
        </ul>
      </FileDrop2>
    </div>
  );
};
const FileBrowser = ({
  id,
  name,
  hash,
  ext,
  globalState,
  closeBrowser,
}) => {
  const [files, setFiles] = useState([]);
  const [hashes, setHashes] = useState([]);
  const [tab, setTab] = useState('files');
  const [currentHash, setCurrentHash] = useState(hash);
  const [lastUpdateHash, setLastUpdateHash] = useState(null);
  const [renamingFile, setRenamingFile] = useState(null);
  const [isCollaborator, setIsCollaborator] = useState(false);
  
  useEffect(async () => {
    const u = `https://tokens.webaverse.com/isCollaborator/${id}/${globalState.address}`;
    const res = await fetch(u);
    const newIsCollaborator = await res.json();
    setIsCollaborator(newIsCollaborator);
  }, [id, globalState.address]);
  
  // console.log('got hash 1.1', {name, hash, ext, files, renamingFile});
  
  if (lastUpdateHash !== currentHash) {
    (async () => {
      const { web3, contracts, getNetworkName, getMainnetAddress } = await getBlockchain();

      const networkName = getNetworkName();
      const latest = await web3[networkName + "sidechain"].eth.getBlockNumber();
      const hashUpdateEntries = await contracts['mainnetsidechain']['NFT'].getPastEvents('HashUpdate', {
        fromBlock: 0,
        toBlock: latest,
      });
      
      const queue = [hash];
      for (let i = hashUpdateEntries.length - 1; i >= 0; i--) {
        const hashUpdateEntry = hashUpdateEntries[i];
        const {returnValues: {oldHash, newHash}} = hashUpdateEntry;
        if (queue[queue.length - 1] === newHash) {
          queue.push(oldHash);
        }
      }
      queue.reverse();
      setHashes(queue);
    })();
    setLastUpdateHash(currentHash);
  }
  
  const u = _getUrlForHashExt(currentHash, name, ext);
  const handleFileUpload = async file => {
    const res = await fetch('https://ipfs.exokit.org/', {
      method: 'POST',
      body: file,
    });
    const j = await res.json();
    const {hash: newHash} = j;
    const oldHash = hash;
    
    // console.log('handle file upload', file);
    // debugger;
    
    const ext = getExt(file.name);
    
    const mnemonic = globalState.loginToken.mnemonic;
    const updateHashResult = await runSidechainTransaction(mnemonic)('NFT', 'updateHash', oldHash, newHash);
    const setMetadataResult = await runSidechainTransaction(mnemonic)('NFT', 'setMetadata', newHash, 'ext', ext);
    console.log('file uploaded ok', {oldHash, newHash, ext, updateHashResult, setMetadataResult});
    closeBrowser();
  };
  const _save = async () => {
    console.log('clicked save', files);
    
    // setLoading(true);
    if (files.length > 1) {
      const filesArray = files.map(f => f.blob);
      // debugger;
      const wbn = await makeWbn(filesArray);
      await handleFileUpload(wbn);
    } else if (files.length === 1) {
      if (getExt(files[0].pathname) === "glb") {
        const filesArray = files.map(f => f.blob);
        const wbn = await makePhysicsBake(filesArray);
        await handleFileUpload(wbn);
      } else if (['glb', 'png', 'vrm'].indexOf(getExt(files[0].pathname)) >= 0) {
        // debugger;
        await handleFileUpload(files[0].blob);
      } else {
        alert("Use one of the support file formats: png, glb, vrm");
        // setLoading(false);
      }
    } else {
      alert("No files uploaded!");
      // setLoading(false);
    }
  };
  const _handleHashClick = hash => {
    setCurrentHash(hash);
  };
  
  return (
    <div className="fileBrowser">
      <div className="background" onClick={closeBrowser} />
      <div className="wrap">
        <header className={`${isCollaborator ? '' : 'disabled'}`}>{isCollaborator ? 'You can edit this bundle' : 'This bundle belongs to someone else'}</header>
        <div className="tabs">
          <div
            className={`tab ${tab === 'files' ? 'selected' : ''}`}
            onClick={() => {
              setTab('files');
            }}
          >Files</div>
          <div
            className={`tab ${tab === 'history' ? 'selected' : ''}`}
            onClick={() => {
              setTab('history');
            }}
          >History</div>
        </div>
        {(() => {
          switch (tab) {
            case 'files': {
              return (
                <BundleFileContents
                  name={name}
                  ext={ext}
                  url={u}
                  files={files}
                  currentHash={currentHash}
                  setFiles={setFiles}
                  renamingFile={renamingFile}
                  setRenamingFile={setRenamingFile}
                  key={`${name}:${ext}:${hash}`}
                />
              );
            }
            case 'history': {
              return (
                <ul className="history">
                  {hashes.map((hash, i) => {
                    return (
                      <li className={`history ${hash === currentHash ? 'selected' : ''}`} key={i}>
                        <a href="#" onClick={() => {
                          _handleHashClick(hash);
                        }}>{hash}</a>
                      </li>
                    );
                  })}
                </ul>
              );
            }
            default: {
              return null;
            }
          }
        })()}
        {isCollaborator ? <footer>
          <button onClick={_save}>Commit</button>
        </footer> : null}
      </div>
    </div>
  );
};
export default FileBrowser;