import React, { FC, memo } from "react";
import Particles from "react-particles-js";
import { useThemeChangerContext } from "../contexts/theme-changer-context";

const ParticlesBg: FC = memo(() => {
  const { theme } = useThemeChangerContext();

  return (
    <Particles
      height={"100vh"}
      width={"100vw"}
      params={{
        particles: {
          number: {
            value: 200,
            density: {
              enable: false,
            },
          },
          color: {
            value: theme === "light" ? "#000" : "#fff",
          },
          size: {
            value: 5,
            random: true,
            anim: {
              speed: 6,
              size_min: 0.3,
            },
          },
          line_linked: {
            enable: false,
          },
          move: {
            random: true,
            speed: 2,
            direction: "top",
            out_mode: "out",
          },
        },
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: "bubble",
            },
            onclick: {
              enable: true,
              mode: "repulse",
            },
          },
          modes: {
            bubble: {
              distance: 250,
              duration: 2,
              size: 0,
              opacity: 0,
            },
            repulse: {
              distance: 150,
              duration: 1,
            },
          },
        },
      }}
    />
  );
});

export default ParticlesBg;
