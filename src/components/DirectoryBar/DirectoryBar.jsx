import "./DirectoryBar.css";

function DirectoryBar({ onChangeDirectory, onRefresh }) {
    return (
        <div>
            <button
                className="button"
                onClick={onChangeDirectory}
            >
                Change directory
            </button>
        </div>
    );
}

export default DirectoryBar;
