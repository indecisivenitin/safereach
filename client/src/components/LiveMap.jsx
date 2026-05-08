// import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
// import { useEffect } from 'react';
// import L from 'leaflet';

// // Fix default marker icons in Vite
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
// });

// const womanIcon = new L.DivIcon({
//   html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 border-2 border-white shadow-lg text-white text-lg">📍</div>`,
//   className: '',
//   iconSize: [40, 40],
//   iconAnchor: [20, 40],
// });

// const volunteerIcon = new L.DivIcon({
//   html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 border-2 border-white shadow-lg text-white text-lg">🏃</div>`,
//   className: '',
//   iconSize: [40, 40],
//   iconAnchor: [20, 40],
// });

// // Auto-center map when positions change
// function MapAutoCenter({ positions }) {
//   const map = useMap();
//   useEffect(() => {
//     if (positions.length > 0) {
//       if (positions.length === 1) {
//         map.setView(positions[0], map.getZoom());
//       } else {
//         const bounds = L.latLngBounds(positions);
//         map.fitBounds(bounds, { padding: [60, 60] });
//       }
//     }
//   }, [positions, map]);
//   return null;
// }

// export default function LiveMap({ womanPosition, volunteerPosition, className = '' }) {
//   const defaultCenter = womanPosition || volunteerPosition || [28.4089, 77.3178];
//   const positions = [womanPosition, volunteerPosition].filter(Boolean);

//   return (
//     <div className={`rounded-2xl overflow-hidden ${className}`}>
//       <MapContainer
//         center={defaultCenter}
//         zoom={15}
//         style={{ height: '100%', width: '100%' }}
//         zoomControl={false}
//         attributionControl={true}
//       >
//         {/* OpenStreetMap tiles — completely free, no API key */}
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           maxZoom={19}
//         />

//         {womanPosition && (
//           <Marker position={womanPosition} icon={womanIcon}>
//             <Popup>📍 You are here</Popup>
//           </Marker>
//         )}

//         {volunteerPosition && (
//           <Marker position={volunteerPosition} icon={volunteerIcon}>
//             <Popup>🏃 Volunteer location</Popup>
//           </Marker>
//         )}

//         {/* Draw line between woman and volunteer */}
//         {womanPosition && volunteerPosition && (
//           <Polyline
//             positions={[womanPosition, volunteerPosition]}
//             color="#1D9E75"
//             weight={3}
//             dashArray="8 6"
//             opacity={0.7}
//           />
//         )}

//         <MapAutoCenter positions={positions} />
//       </MapContainer>
//     </div>
//   );
// }








import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap
} from 'react-leaflet';

import { useEffect } from 'react';

import L from 'leaflet';

// =====================================================
// FIX LEAFLET ICONS
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// =====================================================
// WOMAN ICON
// =====================================================

const womanIcon =
  new L.DivIcon({

    html: `
      <div
        class="
          flex items-center justify-center
          w-12 h-12 rounded-full
          bg-red-500 border-4 border-white
          shadow-xl text-white text-xl
          animate-pulse
        "
      >
        📍
      </div>
    `,

    className: '',

    iconSize: [48, 48],

    iconAnchor: [24, 48],
  });

// =====================================================
// VOLUNTEER ICON
// =====================================================

const volunteerIcon =
  new L.DivIcon({

    html: `
      <div
        class="
          flex items-center justify-center
          w-12 h-12 rounded-full
          bg-green-500 border-4 border-white
          shadow-xl text-white text-xl
        "
      >
        🏃
      </div>
    `,

    className: '',

    iconSize: [48, 48],

    iconAnchor: [24, 48],
  });

// =====================================================
// AUTO FIT BOUNDS
// =====================================================

function MapAutoCenter({
  positions
}) {

  const map = useMap();

  useEffect(() => {

    if (
      !positions ||
      positions.length === 0
    ) return;

    if (
      positions.length === 1
    ) {

      map.setView(
        positions[0],
        15,
        {
          animate: true
        }
      );

      return;
    }

    const bounds =
      L.latLngBounds(
        positions
      );

    map.fitBounds(
      bounds,
      {
        padding: [80, 80],
        animate: true
      }
    );

  }, [positions, map]);

  return null;
}

// =====================================================
// LIVE MAP
// =====================================================

export default function LiveMap({

  womanPosition,

  volunteerPosition,

  volunteerPath = [],

  className = ''

}) {

  // ---------------------------------------------------
  // DEFAULT CENTER
  // ---------------------------------------------------

  const defaultCenter =
    womanPosition ||
    volunteerPosition || [
      28.6139,
      77.2090
    ];

  // ---------------------------------------------------
  // POSITIONS
  // ---------------------------------------------------

  const positions = [
    womanPosition,
    volunteerPosition
  ].filter(Boolean);

  // ---------------------------------------------------
  // MAIN ROUTE
  // ---------------------------------------------------

  const routePositions =
    womanPosition &&
    volunteerPosition
      ? [
          womanPosition,
          volunteerPosition
        ]
      : [];

  return (

    <div
      className={`
        rounded-2xl
        overflow-hidden
        ${className}
      `}
    >

      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{
          height: '100%',
          width: '100%'
        }}
        zoomControl={false}
        attributionControl={true}
      >

        {/* ================================================= */}
        {/* MAP TILES */}
        {/* ================================================= */}

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

          attribution='&copy; OpenStreetMap contributors'

          maxZoom={19}
        />

        {/* ================================================= */}
        {/* WOMAN MARKER */}
        {/* ================================================= */}

        {
          womanPosition && (

            <>
              <Marker
                position={
                  womanPosition
                }
                icon={
                  womanIcon
                }
              >

                <Popup>
                  📍 You are here
                </Popup>

              </Marker>

              {/* Safety Radius */}

              <Circle
                center={
                  womanPosition
                }
                radius={80}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.15
                }}
              />
            </>
          )
        }

        {/* ================================================= */}
        {/* VOLUNTEER MARKER */}
        {/* ================================================= */}

        {
          volunteerPosition && (

            <>
              <Marker
                position={
                  volunteerPosition
                }
                icon={
                  volunteerIcon
                }
              >

                <Popup>
                  🏃 Volunteer is moving
                </Popup>

              </Marker>

              {/* Volunteer Radius */}

              <Circle
                center={
                  volunteerPosition
                }
                radius={60}
                pathOptions={{
                  color: '#22c55e',
                  fillColor: '#22c55e',
                  fillOpacity: 0.15
                }}
              />
            </>
          )
        }

        {/* ================================================= */}
        {/* MAIN LIVE ROUTE */}
        {/* ================================================= */}

        {
          routePositions.length === 2 && (

            <Polyline
              positions={
                routePositions
              }
              pathOptions={{
                color: '#10b981',
                weight: 6,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          )
        }

        {/* ================================================= */}
        {/* VOLUNTEER MOVEMENT TRAIL */}
        {/* ================================================= */}

        {
          volunteerPath &&
          volunteerPath.length > 1 && (

            <Polyline
              positions={
                volunteerPath.map(
                  (
                    point
                  ) => [
                    point[1],
                    point[0]
                  ]
                )
              }
              pathOptions={{
                color: '#2563eb',
                weight: 4,
                opacity: 0.55,
                dashArray: '10 10'
              }}
            />
          )
        }

        {/* ================================================= */}
        {/* AUTO CENTER */}
        {/* ================================================= */}

        <MapAutoCenter
          positions={
            positions
          }
        />

      </MapContainer>
    </div>
  );
}