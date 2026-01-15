import "./ExecutablesFilter.css";

function ExecutablesFilter({ value, onChange }) {
    return (
        <input
            className="filterBlock"
            type="text"
            placeholder="Filter executables..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

export default ExecutablesFilter;
