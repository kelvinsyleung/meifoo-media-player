import React from "react";
import "./Button.scss";

interface ButtonProps {
    label?: string;
    onClick: () => void;
}

const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({
    label,
    onClick,
    children,
}) => {
    return (
        <button
            className={`vp-btn${label ? " label" : ""}`}
            data-label={label}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
