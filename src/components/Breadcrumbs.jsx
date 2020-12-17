import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const BreadCrumbChip = ({ label, href }) => {
  return (
    <div className="breadcrumb" role="row">
      <span role="button" tabIndex="0">
        <Link to={href}>{label}</Link>
      </span>
    </div>
  );
};

export default function Breadcrumbs() {
  const pathname = useSelector((state) => state.router.location.pathname);
  const collections = useSelector(
    (state) => state.collections.items.entities.collectionsById
  );

  console.log(pathname, pathname.split("/"))

  const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
  const isUuidV4 = (v) => uuidV4Regex.test(v);
  function parsePath(v, i) {
    if (v === "" || v === "collection") {
      return null;
    } else if (isUuidV4(v)) {
      return collections[v]?.name + " Collection";
    } else {
      return v;
    }
  }

  return (
    <div className="crumbbar">
      <section className="crumbbar-section">
        {pathname.split("/").length > 2 ? (
          <BreadCrumbChip href="/" label="Home" />
        ) : null}
        {pathname.split("/").map((v, i) => {
          if (parsePath(v) !== null) {
            return (
              <BreadCrumbChip key={v + i} label={parsePath(v)} href={"#"} />
            );
          }
          return null
        })}
      </section>
    </div>
  );
}
