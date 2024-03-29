import dotenv from "dotenv";
dotenv.config();
import { StatusCodes } from "http-status-codes";
import { EVENT_MESSAGES, SERVER_MESSAGES } from "../utils/messages/messages.js";

// CONSTANTS
const SERVER_URI = process.env.SERVER_URI;
const fields = {
  __v: 0,
  createdAt: 0,
  updatedAt: 0,
};

// DATABASE CONTROLLERS

import {
  CREATEEVENTDB,
  UPDATEEVENTDB,
  DELETEEVENTDB,
  READEVENTDB,
} from "./database/eventDatabase.js";

const createEvent = async (req, res) => {
  try {
    const { eventName, eventYear } = req.body;
    const query = { eventName };

    const eventExists = await READEVENTDB(query, fields);
    if (eventExists.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .send(EVENT_MESSAGES.EVENT_ALREADY_EXISTS);
    }

    const eventImageURL = `${SERVER_URI}/images/events/${req.files["eventImg"][0].filename}`;

    const event = await CREATEEVENTDB({
      eventName,
      eventImageURL,
      eventYear,
    });

    if (event) {
      console.log(EVENT_MESSAGES.EVENT_CREATED, { event });
      return res.status(StatusCodes.CREATED).send({
        response: EVENT_MESSAGES.EVENT_CREATED,
        eventId: event._id,
      });
    } else {
      console.log(EVENT_MESSAGES.ERROR_CREATING_EVENT, { error });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(SERVER_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  } catch (error) {
    console.log(EVENT_MESSAGES.ERROR_CREATING_EVENT, { error });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(SERVER_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

const readEvent = async (req, res) => {
  try {
    const query = !req.query._id ? {} : { _id: req.query.id };
    const event = await READEVENTDB(query, fields);

    if (event.length > 0) {
      console.log(EVENT_MESSAGES.EVENT_FOUND, { event });

      return res.status(StatusCodes.OK).send(event);
    } else {
      console.log(EVENT_MESSAGES.EVENT_NOT_FOUND, { event });
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(EVENT_MESSAGES.EVENT_NOT_FOUND);
    }
  } catch (error) {
    console.log(EVENT_MESSAGES.ERROR_READING_EVENT, { error });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(SERVER_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

const updateEvent = async (req, res) => {
  try {
    const query = { _id: req.query.id };
    const data = req.body;
    const updated = await UPDATEEVENTDB(query, data, fields);
    if (updated) {
      console.log(EVENT_MESSAGES.EVENT_UPDATED, { updated });
      return res.status(StatusCodes.OK).send(updated);
    } else {
      console.log(EVENT_MESSAGES.EVENT_NOT_UPDATED, { updated });
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(EVENT_MESSAGES.EVENT_NOT_UPDATED);
    }
  } catch (error) {
    console.log(EVENT_MESSAGES.ERROR_UPDATING_EVENT, { error });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(SERVER_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

const deleteEvent = async (req, res) => {
  try {
    const query = { _id: req.query.id };
    const deleted = await DELETEEVENTDB(query);
    if (deleted) {
      console.log(EVENT_MESSAGES.EVENT_DELETED, { deleted });
      return res.status(StatusCodes.OK).send(EVENT_MESSAGES.EVENT_DELETED);
    } else {
      console.log(EVENT_MESSAGES.EVENT_NOT_DELETED, { deleted });
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(EVENT_MESSAGES.EVENT_NOT_DELETED);
    }
  } catch (error) {
    console.log(EVENT_MESSAGES.ERROR_DELETING_EVENT, { error });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(SERVER_MESSAGES.INTERNAL_SERVER_ERROR);
  }
};

export {
  createEvent as CREATEEVENT,
  readEvent as READEVENT,
  updateEvent as UPDATEEVENT,
  deleteEvent as DELETEEVENT,
};
