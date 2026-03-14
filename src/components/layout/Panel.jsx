function Panel({ title, subtitle, action, icon: Icon, media, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-heading">
          <div className="panel-title-row">
            {Icon ? (
              <span className="panel-icon" aria-hidden="true">
                <Icon size={16} />
              </span>
            ) : null}
            <h2>{title}</h2>
          </div>
          <p>{subtitle}</p>
        </div>
        <div className="panel-side">
          {media ? (
            <div className="panel-media" aria-hidden="true">
              <img src={media.src} alt={media.alt} loading="lazy" />
            </div>
          ) : null}
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}

export default Panel;
