import "./FileList.css";

function FileList({ files, selectedFile, onSelectFile }) {
    const handleChange = (e) => {
        const file = files[Number(e.target.value)];
        if (file) {
            onSelectFile(file);
        }
    };
    const selectedIndex = selectedFile
        ? files.findIndex((f) => f.name === selectedFile.name)
        : "";

    return (
        <div className="wrapper">
            <select
                className="select"
                value={selectedIndex !== -1 ? selectedIndex : ""}
                onChange={handleChange}
            >
                <option value="">Select file</option>
                {files.map((file, index) => (
                    <option
                        key={index}
                        value={index}
                    >
                        {file.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default FileList;
