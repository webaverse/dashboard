import Link from "next/link";

const User = ({
  label,
  userName,
  address,
  avatarPreview,
}) => {
  return (
    <div className="assetDetailsOwnedBy">
      <Link href={`/accounts/` + address}>
        <a>
          <img
            className="creatorIcon"
            src={(avatarPreview || '').replace(/\.[^.]*$/, ".png")}
          />
        </a>
      </Link>
      <div className="creatorDetails">
        <div className="label">{label}</div>
        <Link href={`/accounts/` + address}>
          <a className="name">{`@${userName}`}</a>
        </Link>
      </div>
    </div>
  );
};
export default User;