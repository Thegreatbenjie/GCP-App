package edu.greenriver.sdev.gcp_app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class controller
{
    @GetMapping("")
    public String home()
    {
        return "Index";
    }
}
