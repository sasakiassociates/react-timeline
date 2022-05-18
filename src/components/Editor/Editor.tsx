import { ReactNode } from 'react';
import { observer } from 'mobx-react';


export type EditorProps = {
    children: ReactNode;
};

export default observer(function Editor({ children }: EditorProps) {
    return (
        <div className="ReactTimeline__Editor">
            {children}
        </div>
    );
})
