import "./PathBar.css";

function PathBar({ path, onRefresh }) {
    return (
        <div className="pathBlock">
            <div className="path">{path || "Folder not selected"}</div>
            <button
                className="refresh"
                onClick={onRefresh}
            >
                ⟳
            </button>
        </div>
    );
}

export default PathBar;
