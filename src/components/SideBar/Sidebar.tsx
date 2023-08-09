import React, { useState } from "react";
import "./Sidebar.scss";
import { UilSignOutAlt, UilBars } from "@iconscout/react-unicons";
import { SidebarData } from "../Data/Data";
import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom"

const Sidebar = () => {
    const [expanded, setExpaned] = useState(true)
    const sidebarVariants = {
        true: {
            left: '0'
        },
        false: {
            left: '-60%'
        }
    }

    return (
        <>
            <div className="bars" style={expanded ? { left: '60%' } : { left: '5%' }} onClick={() => setExpaned(!expanded)}>
                <UilBars />
            </div>
            <motion.div className='sidebar'
                variants={sidebarVariants}
                animate={window.innerWidth <= 768 ? `${expanded}` : ''}
            >

                <div className="logo">
                    <span>
                        Quản lý <span>kho</span>
                    </span>
                </div>

                <div className="menu">
                    {SidebarData.map((item, index) => {
                        return (
                            <NavLink to={item.url}
                                className={(navActive) => `menuItem ${navActive.isActive ? "active" : ""}`}
                                key={index}
                            >
                                <item.icon />
                                <span>{item.heading}</span>
                            </NavLink>
                        );
                    })}
                    {/* signoutIcon */}
                    <Link className="menuItem" to="/">
                        <UilSignOutAlt />
                    </Link>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
