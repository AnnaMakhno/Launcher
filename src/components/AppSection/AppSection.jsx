import "./AppSection.css";

function AppSection({ title, children }) {
    return (
        <section className="appSection">
            <h2 className="appSectionTitle">{title}</h2>
            <div className="appSectionContainer">{children}</div>
        </section>
    );
}

export default AppSection;
