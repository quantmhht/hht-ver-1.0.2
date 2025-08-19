import React, { FunctionComponent } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import Background from "@assets/background.png";
import UtinityItem from "./UtilityItem";
import { Utinity } from "@dts"; // ✅ Import đúng type

interface UtinitiesProps {
    utinities: Utinity[]; // ✅ Sử dụng type Utinity thay vì UtinityItemProps
}

const UtinitiesWrapper = styled.div`
    ${tw`flex flex-row flex-wrap justify-between bg-ui_bg bg-center bg-no-repeat`};
    background-image: url(${Background});
    padding: 16px;
    padding-top: 24px;
`;

const Utinities: FunctionComponent<UtinitiesProps> = props => {
    const { utinities } = props;
    return (
        <UtinitiesWrapper>
            {utinities.map(item => {
                const { key, ...utinity } = item;
                return <UtinityItem key={key} {...utinity} />;
            })}
        </UtinitiesWrapper>
    );
};

export default Utinities;