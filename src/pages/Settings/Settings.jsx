// import useSettings from "./model/useSettings";
import DirectoryBar from "../../components/DirectoryBar/DirectoryBar";
import FileList from "../../components/FileList/FileList";
import FileViewer from "../../components/FileViewer/FileViewer";
import PathBar from "../../components/PathBar/PathBar";
import "./Settings.css";
import AppSection from "../../components/AppSection/AppSection";
import TopBar from "../../components/TopBar/TopBar";

function Settings({
    updateFolderPath,
    files,
    folderPath,
    selectedFile,
    content,
    loadDirectory,
    openFile,
}) {
    // const  = useSettings();
    return (
        <AppSection title="Settings">
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
                        onRefresh={loadDirectory}
                    />
                }
            />
            <FileList
                selectedFile={selectedFile}
                files={files}
                onSelectFile={openFile}
            />
            <FileViewer data={content} />
        </AppSection>
    );
}

export { Settings };
