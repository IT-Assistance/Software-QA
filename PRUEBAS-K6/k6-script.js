import "./libs/shim/core.js";
import "./libs/shim/urijs.js";
import URI from "./libs/urijs.js";
import {
  group
} from "k6";

export let options = {
  maxRedirects: 4,
  duration: "1m",
  vus: 100
};

const Request = Symbol.for("request");
postman[Symbol.for("initial")]({
  options,
  collection: {
    BASE_URL: "https://test-api.k6.io/"
  },
  environment: {
    USERNAME: "test@example.com",
    PASSWORD: "superCroc2020",
    FIRSTNAME: "John",
    LASTNAME: "Doe",
    EMAIL: "test@example.com",
    ACCESS: null,
    REFRESH: null,
    CROCID: null
  }
});

export default function () {
  group("Public APIs", function () {
    postman[Request]({
      name: "List all public crocodiles",
      id: "3ddd46c4-1618-4883-82ff-1b1e3a5f1091",
      method: "GET",
      address: "{{BASE_URL}}/public/crocodiles/"
    });

    postman[Request]({
      name: "Get a single public crocodile",
      id: "9625f17a-b739-4f91-af99-fba1d898953b",
      method: "GET",
      address: "{{BASE_URL}}/public/crocodiles/1/"
    });
  });

  group("Registration and authentication", function () {
    postman[Request]({
      name: "Register a new user",
      id: "d240e1c0-4034-4b3a-90f1-17d927be9ed5",
      method: "POST",
      address: "{{BASE_URL}}/user/register/",
      data: '{\n    "username": "{{USERNAME}}",\n    "first_name": "{{FIRSTNAME}}",\n    "last_name": "{{LASTNAME}}",\n    "email": "{{EMAIL}}",\n    "password": "{{PASSWORD}}"\n}'
    });

    postman[Request]({
      name: "Bearer/JWT token authentication",
      id: "bb2e85a9-39e8-4782-bae6-5fa4c2a4e026",
      method: "POST",
      address: "{{BASE_URL}}/auth/token/login/",
      data: '{\n    "username": "{{USERNAME}}",\n    "password": "{{PASSWORD}}"\n}',
      post(response) {
        var jsonData = response.json();
        pm.environment.set("REFRESH", jsonData.refresh);
        pm.environment.set("ACCESS", jsonData.access);
      }
    });
  });

  group("Private APIs", function () {
    postman[Request]({
      name: "List all your crocodiles",
      id: "7e3f7e7a-cf52-4333-88b8-4f9e4fdfeb4e",
      method: "GET",
      address: "{{BASE_URL}}/my/crocodiles/",
      post(response) {
        var id = response.json("0.id");
        if (id) {
          pm.environment.set("CROCID", id);
        }
      }
    });

    postman[Request]({
      name: "Get a single crocodile",
      id: "8677d7a6-88d4-4dd7-8eba-2ed32d1630c4",
      method: "GET",
      address: "{{BASE_URL}}/my/crocodiles/{{CROCID}}",
      auth(config, Var) {
        const address = new URI(config.address);
        address.username(`${pm[Var]("USERNAME")}`);
        address.password(`${pm[Var]("PASSWORD")}`);
        config.address = address.toString();
        config.options.auth = "basic";
      }
    });

    postman[Request]({
      name: "Create a new crocodile (max 100)",
      id: "4a0934d4-bbe8-4753-9e6b-8f3f81ad2e80",
      method: "POST",
      address: "{{BASE_URL}}/my/crocodiles/",
      data: '{\n\t"name": "Crocodile1",\n\t"sex": "M",\n\t"date_of_birth": "2020-04-03"\n}',
      post(response) {
        var id = response.json("id");
        if (id) {
          pm.environment.set("CROCID", id);
        }
      },
      auth(config, Var) {
        config.headers.Authorization = `Bearer ${pm[Var]("ACCESS")}`;
      }
    });

    postman[Request]({
      name: "Update your crocodile",
      id: "4d2f2942-1a10-4475-801b-531769386da9",
      method: "PUT",
      address: "{{BASE_URL}}/my/crocodiles/{{CROCID}}/",
      data: '{\n\t"name": "Croc",\n\t"sex": "M",\n\t"date_of_birth": "2020-04-03"\n}',
      post(response) {
        var id = response.json("id");
        if (id) {
          pm.environment.set("CROCID", id);
        }
      },
      auth(config, Var) {
        config.headers.Authorization = `Bearer ${pm[Var]("ACCESS")}`;
      }
    });

    postman[Request]({
      name: "Update selected fields on your crocodile",
      id: "12996b9f-f9f4-4437-b449-3b9ed55fc94b",
      method: "PATCH",
      address: "{{BASE_URL}}/my/crocodiles/{{CROCID}}/",
      data: '{\n\t"date_of_birth": "2019-04-03"\n}',
      post(response) {
        var id = response.json("id");
        if (id) {
          pm.environment.set("CROCID", id);
        }
      },
      auth(config, Var) {
        config.headers.Authorization = `Bearer ${pm[Var]("ACCESS")}`;
      }
    });

    postman[Request]({
      name: "Remove your crocodile",
      id: "35cf4ded-6617-4139-b322-a26085a5695b",
      method: "DELETE",
      address: "{{BASE_URL}}/my/crocodiles/{{CROCID}}/",
      auth(config, Var) {
        config.headers.Authorization = `Bearer ${pm[Var]("ACCESS")}`;
      }
    });
  });
}
