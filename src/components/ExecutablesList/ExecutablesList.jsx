import React from "react";
import "./ExecutablesList.css";
import highlightMatch from "../../utils/highlightMatch";

function ExecutablesList({
    executables,
    filter,
    isElectron,
    selectedExecutable,
    onSelect,
}) {
    const getKey = (exe) => exe.fullPath || exe.relativePath;

    const handleClick = (exe) => {
        const clickedKey = getKey(exe);
        const selectedKey = selectedExecutable
            ? getKey(selectedExecutable)
            : null;

        if (clickedKey === selectedKey) {
            onSelect(null);
        } else {
            onSelect(exe);
        }
    };

    if (!executables.length) {
        return <div className="noFiles">No executables found</div>;
    }

    return (
        <div className="exeList">
            <ul>
                {executables.map((exe) => {
                    const key = getKey(exe);
                    const isActive =
                        selectedExecutable &&
                        getKey(selectedExecutable) === key;

                    return (
                        <li
                            key={key}
                            className={isActive ? "active" : ""}
                            onClick={() => handleClick(exe)}
                        >
                            {isElectron ? (
                                <>
                                    <div className="path full">
                                        {highlightMatch(exe.fullPath, filter)}
                                    </div>
                                    <div className="path relative">
                                        {highlightMatch(
                                            exe.relativePath,
                                            filter
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="path relative">
                                    {highlightMatch(exe.relativePath, filter)}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default ExecutablesList;
