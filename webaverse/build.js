import wbn from "./wbn";
import {blobToFile, makePromise, downloadFile, convertMeshToPhysicsMesh, bindUploadFileButton, getExt} from './util';

const typeHandlers = {
  'gltf': "",
  'glb': "",
  'vrm': "",
  'vox': "",
  'png': "",
  'gif': "",
  'jpg': "",
  'js': "",
  'json': "",
  'wbn': "",
  'scn': "",
  'url': "",
  'iframe': "",
  'mediastream': "",
  'geo': "",
  'mp3': "",
  'mp4': ""
};

const primaryUrl = 'https://xrpk.webaverse.com';
const _filterCandidateFiles = files => {
  const result = [];
  for (const type in typeHandlers) {
    for (const file of files) {
      const ext = getExt(file.path);
      if (ext === type) {
        result.push(file);
      }
    }
  }
  return result;
};

export async function makeWbn(files) {
  if (files.length > 0) {
    console.log('got files', files);
    
    for (const file of files) {
      const {type, webkitRelativePath} = file;
      const path = webkitRelativePath.replace(/^[^/]*\//, '');
      file.path = path;
    }
    const candidateFiles = _filterCandidateFiles(files);
    const file = candidateFiles[0];
    if (file) {
      const primaryExchangeUrl = primaryUrl + '/manifest.json';
      const builder = new wbn.BundleBuilder(primaryExchangeUrl);
      for (const file of files) {
        const {type, path} = file;
        const u = new URL(path, primaryUrl);
        const arrayBuffer = await file.arrayBuffer();
        builder.addExchange(u.href, 200, {
          'Content-Type': type || '/application/octet-stream',
        }, new Uint8Array(arrayBuffer));
      }

      const hadManifestJson = files.some(file => file.path === 'manifest.json');
      if (!hadManifestJson) {
        const manifestJson = {
          start_url: encodeURI(file.path),
        };
        const manifestJsonString = JSON.stringify(manifestJson, null, 2);
        builder.addExchange(primaryUrl + '/manifest.json', 200, {
          'Content-Type': 'application/json',
        }, textEncoder.encode(manifestJsonString));
      }

      const buffer = builder.createBundle();
      console.log('got buffer', buffer);
      const blob = new Blob([buffer], {
        type: 'application/webbundle',
      });
      const wbnFile = blobToFile(blob, 'bundle.wbn');
      return wbnFile;
    } else {
      window.alert('This folder does not have any XRPK-able file types.\nAllowed types: ' + Object.keys(typeHandlers).join(', '));
    }
  }
}
