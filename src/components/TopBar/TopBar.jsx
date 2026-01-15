import "./TopBar.css";

function TopBar({ left, right }) {
    return (
        <div className="topBar">
            <div className="topBarLeft">{left}</div>
            <div className="topBarRight">{right}</div>
        </div>
    );
}

export default TopBar;
