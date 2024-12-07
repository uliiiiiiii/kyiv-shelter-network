import { Popup } from "react-leaflet"

interface ShelterInfoPopupProps{
    address: string, shelter_type: string, place: string, accessibility: boolean
}

export default function ShelterInfoPopup({address, shelter_type, place, accessibility} : ShelterInfoPopupProps){
    return (
        <Popup>
                      <div>
                        <h3>{address}</h3>
                        <p>
                          <strong>Тип:</strong> {shelter_type}
                        </p>
                        <p>
                          <strong>Місце:</strong> {place}
                        </p>
                        <p>
                          <strong>Пандус:</strong> {accessibility ? 'Є' : 'Немає'}
                        </p>
                      </div>
                    </Popup>
    )
}