import "./styles/entryForm.scss";
import React, {useMemo} from "react";
import TabMenu from "@/components/TabMenu/TabMenu";
import { useParams, useLocation } from "react-router-dom";
import {  TabMenu as TabMenuType } from "@/types";

const Tab1Content = React.lazy(() => import("./page/ListEntryForm"));

const EntryForm = () =>{
    const {id, nameSource} = useParams();
    
    const dataTab = useMemo(
        () => [
            {
                tabName: 'create',
                name: 'Danh sách chưa làm phiếu',
                hash: ['#index'],
                navLink: '#index',
                url: `/item-source/${id}/${nameSource}#index`,
                component: Tab1Content,
            },
            {
                tabName: 'show',
                name: 'Danh sách đã làm phiếu',
                hash: ['#list'],
                navLink: '#list',
                url: `/item-source/${id}/${nameSource}#list`,
                component: Tab1Content,
            }
        ],
        [id]
    );

    const component = useMemo(() => [<Tab1Content />], []);

    return (
        <TabMenu data={dataTab} component={component}/>
    )
}

export default EntryForm