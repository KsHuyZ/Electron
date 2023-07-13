import React, { useState, memo } from "react";
import "./tabMenu.scss";
import { TabMenu as TabMenuType } from "@/types";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";


interface PropsTabMenu {
    data: TabMenuType[],
    component :any
}

const Content = memo(function(props: any) {
    let indexComponent = 0;
    props.data?.map((item: any, index: number) => {
      if (item.tabName === props.activeRegisterTab) {
        indexComponent = index;
      }
    });
    return props.component[indexComponent];
  });

function TabMenu (props: PropsTabMenu){
    const [activeTab, setActiveTab] = useState(props.data && props.data.length > 0 ? props.data[0].tabName : '');
    const location =  useLocation();
    const navigate = useNavigate();

    useEffect(() =>{
        if(!location.hash && props.data && props.data.length > 0){
            setActiveTab(props.data[0].tabName);
            if(props.data[0].url) navigate(props.data[0].url);
        }
        props.data?.map((item : TabMenuType , index : number) =>{
            if(item.hash.includes(location.hash)){
                setActiveTab(item.tabName);
                if(index === 0 && item.url) navigate(item.url)
            }
        })
    },[location.hash]);

    return (
        <div className="content-wrapper">
            <section className="content-header">
                <ul className="nav-tabs">
                    {
                        props.data?.map((item: TabMenuType, index: number) =>(
                                                    <NavLink  key={item.tabName} className={'nav-item'} to={item.navLink} data-toggle="tab">
                            <li className={activeTab === item.tabName ? 'nav-tabs__item actives' : 'nav-tabs__item'}>
                                                    {item.name}
                                                </li>
                                                    </NavLink>
                        ))
                    }
                    
                </ul>
            </section>
            <React.Suspense fallback={<></>}>
                <Content
                 activeRegisterTab={activeTab}
                 data={props.data}
                 component={props.component}
                />
            </React.Suspense>
        </div>
    )
}

export default memo(TabMenu)