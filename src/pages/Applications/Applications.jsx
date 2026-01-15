import React, { useMemo } from "react";
// import useApplications from "./model/useApplications";
import DirectoryBar from "../../components/DirectoryBar/DirectoryBar";
import "./Applications.css";
import AppSection from "../../components/AppSection/AppSection";
import PathBar from "../../components/PathBar/PathBar";
import ExecutablesFilter from "../../components/ExecutablesFilter/ExecutablesFilter";
import ExecutablesList from "../../components/ExecutablesList/ExecutablesList";
import TopBar from "../../components/TopBar/TopBar";

function Applications({
    folderPath,
    executables,
    loadDirectory,
    updateFolderPath,
    filter,
    setFilter,
    selectExecutable,
    selectedExecutable,
}) {
    // const {
    //     folderPath,
    //     executables,
    //     loadDirectory,
    //     updateFolderPath,
    //     filter,
    //     setFilter,
    //     selectExecutable,
    //     selectedExecutable,
    // } = useApplications();

    const filteredExecutables = useMemo(() => {
        return executables.filter(
            (exe) =>
                exe.fullPath?.toLowerCase().includes(filter.toLowerCase()) ||
                exe.relativePath?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [executables, filter]);

    return (
        <AppSection title="Applications">
            <TopBar
                left={
                    <PathBar
                        path={folderPath}
                        onRefresh={updateFolderPath}
                    />
                }
                right={
                    <DirectoryBar
                        onChangeDirectory={loadDirectory}
                        onRefresh={updateFolderPath}
                    />
                }
            />
            <ExecutablesFilter
                value={filter}
                onChange={setFilter}
            />
            <ExecutablesList
                executables={filteredExecutables}
                filter={filter}
                isElectron={!!window?.require}
                selectedExecutable={selectedExecutable}
                onSelect={selectExecutable}
            />
        </AppSection>
    );
}

export { Applications };
