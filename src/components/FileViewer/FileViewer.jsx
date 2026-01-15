import "./FileViewer.css";

const FileViewer = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return <div>No configuration data available.</div>;
    }
    return (
        <div className="table">
            {data.map((config, index) => {
                return (
                    <div
                        key={index}
                        className="row"
                    >
                        <span className="key">{config.Key}</span>
                        <span>=</span>
                        <span className="value">{config.Value}</span>
                    </div>
                );
            })}
        </div>
    );
};
export default FileViewer;
