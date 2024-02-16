import React from "react";
import { CSSTransition } from "react-transition-group";

interface DropdownProps {
    on: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ on }) => {
    return (
        <CSSTransition
            in={on}
            classNames="vp-dropdown"
            timeout={200}
            mountOnEnter
            unmountOnExit
        >
            <div className="vp-dropdown"></div>
        </CSSTransition>
    );
};

export default Dropdown;
