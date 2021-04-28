const FileInput = ({
  file,
  setFile,
}) => {
  return (file ?
    <div className="file">
      <div className="text">{file.name}</div>
      <img className="cancel-button" src="/cancel.svg" onClick={e => {
        setFile(null);
      }} />
    </div>
  :
    <input type="file" placeholder="File" onChange={e => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        setFile(files[0]);
      } else {
        setFile(null);
      }
    }} />
  );
};
export default FileInput;