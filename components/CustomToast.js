import { DefaultToast } from 'react-toast-notifications';
import Link from 'next/link';

export default ({ children, link, ...props }) => (
  <DefaultToast style={{ backgroundColor: "#181818", border: "1px solid" }} {...props}>
    { link ?
      <Link href={link}><a>{children}</a></Link>
    :
      <>{children}</>
    }
  </DefaultToast>
);
